import { Component, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { getDb, Transaction } from './db';
import { liveQuery } from 'dexie';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="px-4 pt-8 pb-32">
      <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="ios-card p-4 bg-emerald-50 border-emerald-100">
          <p class="text-xs font-semibold text-emerald-600 uppercase mb-1">Income</p>
          <p class="text-xl font-bold text-emerald-700">{{ totalIncome() | currency }}</p>
        </div>
        <div class="ios-card p-4 bg-rose-50 border-rose-100">
          <p class="text-xs font-semibold text-rose-600 uppercase mb-1">Expenses</p>
          <p class="text-xl font-bold text-rose-700">{{ totalExpense() | currency }}</p>
        </div>
      </div>

      <!-- Net Balance -->
      <div class="ios-card p-6 mb-8 bg-ios-blue text-white shadow-ios-blue/20">
        <p class="text-sm font-medium opacity-80 mb-1">Net Balance</p>
        <p class="text-4xl font-bold">{{ (totalIncome() - totalExpense()) | currency }}</p>
      </div>

      <!-- Account Balances -->
      <h2 class="text-xl font-bold mb-4 px-1">Accounts</h2>
      <div class="grid grid-cols-2 gap-4 mb-8">
        @for (acc of accountBalances(); track acc.name) {
          <div class="ios-card p-4">
            <p class="text-xs font-semibold text-ios-secondary uppercase mb-1">{{ acc.name }}</p>
            <p class="text-lg font-bold" [class.text-rose-600]="acc.balance < 0">{{ acc.balance | currency }}</p>
          </div>
        }
      </div>

      <!-- Category Breakdown -->
      <h2 class="text-xl font-bold mb-4 px-1">Top Categories</h2>
      <div class="ios-card overflow-hidden mb-8">
        @for (cat of categoryStats(); track cat.name; let last = $last) {
          <div class="p-4 flex items-center" [class.border-b]="!last" [class.border-black/5]="!last">
            <div class="flex-1">
              <div class="flex justify-between mb-1">
                <span class="font-semibold">{{ cat.name }}</span>
                <span class="text-ios-secondary">{{ cat.amount | currency }}</span>
              </div>
              <div class="w-full bg-black/5 h-2 rounded-full overflow-hidden">
                <div class="bg-ios-blue h-full rounded-full" [style.width.%]="cat.percent"></div>
              </div>
            </div>
          </div>
        } @empty {
          <div class="p-8 text-center text-ios-secondary">No data to display</div>
        }
      </div>

      <!-- Monthly Trend -->
      <h2 class="text-xl font-bold mb-4 px-1">Monthly Trend</h2>
      <div class="ios-card p-6 h-48 flex items-end justify-between space-x-2 mb-8">
        @for (month of monthlyTrend(); track month.name) {
          <div class="flex-1 flex flex-col items-center group">
            <div class="w-full bg-ios-blue/10 rounded-t-lg relative flex items-end justify-center" [style.height.px]="120">
               <div class="bg-ios-blue w-full rounded-t-lg transition-all duration-500" 
                    [style.height.%]="month.percent">
               </div>
            </div>
            <span class="text-[10px] text-ios-secondary mt-2 font-medium">{{ month.name }}</span>
          </div>
        }
      </div>

      <!-- Daily Spending (Last 7 Days) -->
      <h2 class="text-xl font-bold mb-4 px-1">Daily Spending</h2>
      <div class="ios-card p-6 h-48 flex items-end justify-between space-x-2">
        @for (day of dailySpending(); track day.date) {
          <div class="flex-1 flex flex-col items-center group">
            <div class="w-full bg-rose-100 rounded-t-lg relative flex items-end justify-center" [style.height.px]="120">
               <div class="bg-rose-500 w-full rounded-t-lg transition-all duration-500" 
                    [style.height.%]="day.percent">
               </div>
            </div>
            <span class="text-[8px] text-ios-secondary mt-2 font-medium">{{ day.date | date:'EEE' }}</span>
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent {
  private platformId = inject(PLATFORM_ID);
  transactions = signal<Transaction[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      liveQuery(() => getDb().transactions.toArray())
        .subscribe(data => this.transactions.set(data));
    }
  }

  totalIncome = computed(() => 
    this.transactions()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  totalExpense = computed(() => 
    this.transactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  accountBalances = computed(() => {
    const balances: Record<string, number> = {};
    this.transactions().forEach(t => {
      const amount = t.type === 'income' ? t.amount : -t.amount;
      balances[t.account] = (balances[t.account] || 0) + amount;
    });
    return Object.entries(balances).map(([name, balance]) => ({ name, balance }));
  });

  categoryStats = computed(() => {
    const stats: Record<string, number> = {};
    const expenses = this.transactions().filter(t => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    expenses.forEach(t => {
      stats[t.category] = (stats[t.category] || 0) + t.amount;
    });

    return Object.entries(stats)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  });

  monthlyTrend = computed(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months: { name: string; amount: number; percent: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonth - i + 12) % 12;
      last6Months.push({ name: months[mIdx], amount: 0, percent: 0 });
    }

    const expenses = this.transactions().filter(t => t.type === 'expense');
    expenses.forEach(t => {
      const date = new Date(t.date);
      const mName = months[date.getMonth()];
      const monthObj = last6Months.find(m => m.name === mName);
      if (monthObj) monthObj.amount += t.amount;
    });

    const maxAmount = Math.max(...last6Months.map(m => m.amount), 1);
    last6Months.forEach(m => m.percent = (m.amount / maxAmount) * 100);

    return last6Months;
  });

  dailySpending = computed(() => {
    const days: { date: Date, amount: number, percent: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      days.push({ date: d, amount: 0, percent: 0 });
    }

    const expenses = this.transactions().filter(t => t.type === 'expense');
    expenses.forEach(t => {
      const tDate = new Date(t.date);
      const dayObj = days.find(d => d.date.toDateString() === tDate.toDateString());
      if (dayObj) dayObj.amount += t.amount;
    });

    const maxAmount = Math.max(...days.map(d => d.amount), 1);
    days.forEach(d => d.percent = (d.amount / maxAmount) * 100);

    return days;
  });
}
