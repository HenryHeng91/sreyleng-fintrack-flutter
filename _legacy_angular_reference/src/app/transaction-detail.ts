import { Component, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { getDb, Account, Source } from './db';
import { liveQuery } from 'dexie';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="px-4 pt-8 pb-32">
      <div class="flex justify-between items-center mb-6">
        <button (click)="back()" class="flex items-center text-ios-blue font-medium">
          <mat-icon>chevron_left</mat-icon>
          Back
        </button>
        <h1 class="text-xl font-bold">Transaction Details</h1>
        <button (click)="delete()" class="text-rose-600 font-medium">Delete</button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div class="ios-card p-4 space-y-4">
          <div>
            <label for="type-toggle" class="text-xs font-semibold text-ios-secondary uppercase ml-1 mb-1 block">Type</label>
            <div id="type-toggle" class="flex bg-black/5 p-1 rounded-xl">
              <button type="button" 
                      (click)="setType('expense')"
                      class="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                      [class.bg-white]="form.get('type')?.value === 'expense'"
                      [class.shadow-sm]="form.get('type')?.value === 'expense'">
                Expense
              </button>
              <button type="button" 
                      (click)="setType('income')"
                      class="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                      [class.bg-white]="form.get('type')?.value === 'income'"
                      [class.shadow-sm]="form.get('type')?.value === 'income'">
                Income
              </button>
            </div>
          </div>

          <div>
            <label for="amount-input" class="text-xs font-semibold text-ios-secondary uppercase ml-1 mb-1 block">Amount</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-ios-secondary font-bold">$</span>
              <input id="amount-input" type="number" formControlName="amount" class="ios-input pl-8 text-2xl font-bold" placeholder="0.00">
            </div>
          </div>

          <div>
            <label for="desc-input" class="text-xs font-semibold text-ios-secondary uppercase ml-1 mb-1 block">Description</label>
            <input id="desc-input" type="text" formControlName="description" class="ios-input" placeholder="What was this for?">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="cat-select" class="text-xs font-semibold text-ios-secondary uppercase ml-1 mb-1 block">Category</label>
              <select id="cat-select" formControlName="category" class="ios-input appearance-none">
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Utility">Utility</option>
                <option value="Salary">Salary</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label for="acc-select" class="text-xs font-semibold text-ios-secondary uppercase ml-1 mb-1 block">Account</label>
              <select id="acc-select" formControlName="account" class="ios-input appearance-none">
                @for (acc of accounts(); track acc.id) {
                  <option [value]="acc.name">{{ acc.name }}</option>
                }
              </select>
            </div>
          </div>

          <div>
            <label for="source-select" class="text-xs font-semibold text-ios-secondary uppercase ml-1 mb-1 block">Source</label>
            <select id="source-select" formControlName="source" class="ios-input appearance-none">
              @for (src of sources(); track src.id) {
                <option [value]="src.name">{{ src.name }}</option>
              }
            </select>
          </div>

          <div>
            <label for="date-input" class="text-xs font-semibold text-ios-secondary uppercase ml-1 mb-1 block">Date</label>
            <input id="date-input" type="date" formControlName="date" class="ios-input">
          </div>
        </div>

        <button type="submit" 
                [disabled]="form.invalid || form.pristine"
                class="w-full ios-btn-primary py-4 text-lg shadow-xl disabled:opacity-50">
          Update Transaction
        </button>
      </form>
    </div>
  `
})
export class TransactionDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  transactionId?: number;
  accounts = signal<Account[]>([]);
  sources = signal<Source[]>([]);

  form = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    description: ['', Validators.required],
    category: ['Other', Validators.required],
    account: ['', Validators.required],
    source: ['', Validators.required],
    date: ['', Validators.required],
    type: ['expense' as 'expense' | 'income', Validators.required]
  });

  ngOnInit() {
    this.transactionId = Number(this.route.snapshot.paramMap.get('id'));
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
      this.loadTransaction();
    }
  }

  loadData() {
    liveQuery(() => getDb().accounts.toArray()).subscribe(data => this.accounts.set(data));
    liveQuery(() => getDb().sources.toArray()).subscribe(data => this.sources.set(data));
  }

  async loadTransaction() {
    const tx = await getDb().transactions.get(this.transactionId!);
    if (tx) {
      this.form.patchValue({
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        account: tx.account,
        source: tx.source,
        date: tx.date,
        type: tx.type
      });
    }
  }

  setType(type: 'expense' | 'income') {
    this.form.patchValue({ type });
    this.form.markAsDirty();
  }

  async onSubmit() {
    if (this.form.valid && isPlatformBrowser(this.platformId)) {
      const val = this.form.value;
      await getDb().transactions.update(this.transactionId!, {
        amount: val.amount!,
        description: val.description!,
        category: val.category!,
        account: val.account!,
        source: val.source!,
        date: val.date!,
        type: val.type!
      });
      this.back();
    }
  }

  async delete() {
    if (confirm('Are you sure you want to delete this transaction?') && isPlatformBrowser(this.platformId)) {
      await getDb().transactions.delete(this.transactionId!);
      this.back();
    }
  }

  back() {
    this.router.navigate(['/transactions']);
  }
}
