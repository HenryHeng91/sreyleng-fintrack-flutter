import { Component, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { getDb, Transaction, Account, Source } from './db';
import { OcrService } from './ocr';
import { liveQuery } from 'dexie';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="px-4 pt-8 pb-32">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Add Transaction</h1>
        <button (click)="close()" class="text-ios-blue font-medium">Cancel</button>
      </div>

      <!-- Small OCR Button -->
      <div class="flex justify-end mb-4">
        <label class="bg-ios-blue/10 text-ios-blue rounded-full px-4 py-2 text-sm font-bold flex items-center cursor-pointer active:opacity-70">
          <mat-icon class="mr-1 text-lg">document_scanner</mat-icon>
          Smart Scan
          <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)" multiple>
        </label>
      </div>

      @if (isProcessing()) {
        <div class="ios-card p-4 mb-6 flex items-center text-ios-blue font-medium animate-pulse">
          <mat-icon class="animate-spin mr-2">sync</mat-icon>
          AI is analyzing receipt...
        </div>
      }

      <!-- Batch Preview -->
      @if (pendingTransactions().length > 0) {
        <div class="mb-6">
          <h2 class="text-xs font-semibold text-ios-secondary uppercase tracking-wider mb-2 px-1">Batch Preview ({{ pendingTransactions().length }})</h2>
          <div class="ios-card overflow-hidden">
            @for (tx of pendingTransactions(); track $index; let last = $last) {
              <div class="p-3 flex items-center" [class.border-b]="!last" [class.border-black/5]="!last">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold truncate">{{ tx.description }}</p>
                  <p class="text-[10px] text-ios-secondary">{{ tx.amount | currency }} • {{ tx.category }}</p>
                </div>
                <button (click)="removePending($index)" class="text-rose-600">
                  <mat-icon class="text-lg">close</mat-icon>
                </button>
              </div>
            }
          </div>
          <button (click)="saveBatch()" class="w-full mt-2 text-ios-blue font-bold text-sm">Save All Batch</button>
        </div>
      }

      <!-- Manual Form -->
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
              <div class="relative">
                <select id="acc-select" formControlName="account" class="ios-input appearance-none" (change)="onAccountChange($event)">
                  @for (acc of accounts(); track acc.id) {
                    <option [value]="acc.name">{{ acc.name }}</option>
                  }
                  <option value="__NEW__">+ Add New</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label for="source-select" class="text-xs font-semibold text-ios-secondary uppercase ml-1 mb-1 block">Source</label>
            <select id="source-select" formControlName="source" class="ios-input appearance-none" (change)="onSourceChange($event)">
              @for (src of sources(); track src.id) {
                <option [value]="src.name">{{ src.name }}</option>
              }
              <option value="__NEW__">+ Add New</option>
            </select>
          </div>

          <div>
            <label for="date-input" class="text-xs font-semibold text-ios-secondary uppercase ml-1 mb-1 block">Date</label>
            <input id="date-input" type="date" formControlName="date" class="ios-input">
          </div>
        </div>

        <button type="submit" 
                [disabled]="form.invalid || isProcessing()"
                class="w-full ios-btn-primary py-4 text-lg shadow-xl disabled:opacity-50">
          Save Transaction
        </button>
      </form>
    </div>
  `
})
export class AddTransactionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ocr = inject(OcrService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  isProcessing = signal(false);
  pendingTransactions = signal<Partial<Transaction>[]>([]);
  accounts = signal<Account[]>([]);
  sources = signal<Source[]>([]);

  form = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    description: ['', Validators.required],
    category: ['Other', Validators.required],
    account: ['', Validators.required],
    source: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    type: ['expense' as 'expense' | 'income', Validators.required]
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    }
  }

  loadData() {
    liveQuery(() => getDb().accounts.toArray()).subscribe(data => {
      this.accounts.set(data);
      if (data.length > 0 && !this.form.get('account')?.value) {
        this.form.patchValue({ account: data[0].name });
      }
    });
    liveQuery(() => getDb().sources.toArray()).subscribe(data => {
      this.sources.set(data);
      if (data.length > 0 && !this.form.get('source')?.value) {
        this.form.patchValue({ source: data[0].name });
      }
    });
  }

  setType(type: 'expense' | 'income') {
    this.form.patchValue({ type });
  }

  async onAccountChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    if (select.value === '__NEW__') {
      const name = prompt('Enter new account name:');
      if (name) {
        await getDb().accounts.add({ name });
        this.form.patchValue({ account: name });
      } else {
        this.form.patchValue({ account: this.accounts()[0]?.name || '' });
      }
    }
  }

  async onSourceChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    if (select.value === '__NEW__') {
      const name = prompt('Enter new source name:');
      if (name) {
        await getDb().sources.add({ name });
        this.form.patchValue({ source: name });
      } else {
        this.form.patchValue({ source: this.sources()[0]?.name || '' });
      }
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length === 0) return;

    this.isProcessing.set(true);
    for (const file of files) {
      try {
        const base64 = await this.fileToBase64(file);
        const result = await this.ocr.processReceipt(base64);
        if (result) {
          this.pendingTransactions.set([...this.pendingTransactions(), result]);
        }
      } catch (error) {
        console.error('OCR Error:', error);
      }
    }
    this.isProcessing.set(false);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  removePending(index: number) {
    const current = this.pendingTransactions();
    current.splice(index, 1);
    this.pendingTransactions.set([...current]);
  }

  async saveBatch() {
    if (isPlatformBrowser(this.platformId)) {
      for (const tx of this.pendingTransactions()) {
        await getDb().transactions.add({
          amount: tx.amount!,
          description: tx.description!,
          category: tx.category!,
          account: tx.account || this.form.get('account')?.value || 'Cash',
          source: tx.source || this.form.get('source')?.value || 'Wallet',
          date: tx.date!,
          type: tx.type!
        });
      }
      this.pendingTransactions.set([]);
      this.router.navigate(['/transactions']);
    }
  }

  async onSubmit() {
    if (this.form.valid && isPlatformBrowser(this.platformId)) {
      const val = this.form.value;
      await getDb().transactions.add({
        amount: val.amount!,
        description: val.description!,
        category: val.category!,
        account: val.account!,
        source: val.source!,
        date: val.date!,
        type: val.type!
      });
      this.router.navigate(['/transactions']);
    }
  }

  close() {
    this.router.navigate(['/transactions']);
  }
}
