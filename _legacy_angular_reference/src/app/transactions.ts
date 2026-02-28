import { Component, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { getDb, Transaction } from './db';
import { liveQuery } from 'dexie';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="px-4 pt-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Transactions</h1>
        <button routerLink="/statement-ocr" class="text-ios-blue flex items-center text-sm font-medium">
          <mat-icon class="mr-1">description</mat-icon>
          Statement
        </button>
      </div>
      
      @if (groupedTransactions().length === 0) {
        <div class="flex flex-col items-center justify-center py-20 text-ios-secondary">
          <mat-icon class="text-6xl h-auto w-auto mb-4 opacity-20">receipt_long</mat-icon>
          <p>No transactions yet</p>
        </div>
      }

      @for (group of groupedTransactions(); track group.date) {
        <div class="mb-6">
          <h2 class="text-xs font-semibold text-ios-secondary uppercase tracking-wider mb-2 px-1">
            {{ group.date | date:'EEEE, MMM d' }}
          </h2>
          <div class="ios-card overflow-hidden">
            @for (tx of group.items; track tx.id; let last = $last) {
              <button (click)="viewDetail(tx.id!)" 
                      class="w-full text-left flex items-center p-4 active:bg-black/5 transition-colors cursor-pointer" 
                      [class.border-b]="!last" [class.border-black/5]="!last">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-4" 
                     [ngClass]="tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'">
                  <mat-icon>{{ getCategoryIcon(tx.category) }}</mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold truncate">{{ tx.description }}</p>
                  <p class="text-xs text-ios-secondary">{{ tx.category }} • {{ tx.account }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold" [ngClass]="tx.type === 'income' ? 'text-emerald-600' : 'text-ios-label'">
                    {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | currency }}
                  </p>
                </div>
              </button>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class TransactionsComponent {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  transactions = signal<Transaction[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      liveQuery(() => getDb().transactions.orderBy('date').reverse().toArray())
        .subscribe(data => this.transactions.set(data));
    }
  }

  viewDetail(id: number) {
    this.router.navigate(['/transaction', id]);
  }

  groupedTransactions = computed(() => {
    const groups: { date: string, items: Transaction[] }[] = [];
    this.transactions().forEach(tx => {
      let group = groups.find(g => g.date === tx.date);
      if (!group) {
        group = { date: tx.date, items: [] };
        groups.push(group);
      }
      group.items.push(tx);
    });
    return groups;
  });

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'Food': 'restaurant',
      'Transport': 'directions_car',
      'Shopping': 'shopping_bag',
      'Utility': 'bolt',
      'Salary': 'payments',
      'Entertainment': 'movie',
      'Health': 'medical_services',
      'Other': 'more_horiz'
    };
    return icons[category] || 'receipt';
  }
}
