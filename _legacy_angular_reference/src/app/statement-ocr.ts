import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { OcrService } from './ocr';
import { getDb, Transaction } from './db';

@Component({
  selector: 'app-statement-ocr',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="px-4 pt-8 pb-32">
      <div class="flex justify-between items-center mb-6">
        <button (click)="back()" class="flex items-center text-ios-blue font-medium">
          <mat-icon>chevron_left</mat-icon>
          Back
        </button>
        <h1 class="text-xl font-bold">Statement OCR</h1>
        <div></div>
      </div>

      <div class="ios-card p-8 mb-6 flex flex-col items-center text-center border-dashed border-2 border-ios-blue/30">
        <mat-icon class="text-5xl text-ios-blue mb-4">upload_file</mat-icon>
        <h2 class="text-lg font-bold mb-2">Upload Statement</h2>
        <p class="text-sm text-ios-secondary mb-6">Upload a photo of your credit card statement to extract all transactions.</p>
        
        <label class="ios-btn-primary px-8 py-3 flex items-center cursor-pointer">
          <mat-icon class="mr-2">add_a_photo</mat-icon>
          Select Statement
          <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
        </label>

        @if (isProcessing()) {
          <div class="mt-6 flex flex-col items-center text-ios-blue animate-pulse">
            <mat-icon class="animate-spin text-3xl mb-2">sync</mat-icon>
            <p class="font-medium">AI is extracting transactions...</p>
          </div>
        }
      </div>

      @if (pendingTransactions().length > 0) {
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Preview ({{ pendingTransactions().length }})</h2>
            <button (click)="confirmAll()" class="text-ios-blue font-bold">Confirm All</button>
          </div>
          
          <div class="ios-card overflow-hidden">
            @for (tx of pendingTransactions(); track $index; let last = $last) {
              <div class="p-4 flex items-center" [class.border-b]="!last" [class.border-black/5]="!last">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold truncate">{{ tx.description }}</p>
                  <p class="text-xs text-ios-secondary">{{ tx.date }} • {{ tx.category }}</p>
                </div>
                <div class="text-right ml-4">
                  <p class="font-bold" [ngClass]="tx.type === 'income' ? 'text-emerald-600' : 'text-ios-label'">
                    {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | currency }}
                  </p>
                  <button (click)="removePending($index)" class="text-[10px] text-rose-600 font-bold uppercase">Remove</button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class StatementOcrComponent {
  private ocr = inject(OcrService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  isProcessing = signal(false);
  pendingTransactions = signal<Partial<Transaction>[]>([]);

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isProcessing.set(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const results = await this.ocr.processStatement(base64);
        this.pendingTransactions.set([...this.pendingTransactions(), ...results]);
        this.isProcessing.set(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Statement OCR Error:', error);
      this.isProcessing.set(false);
    }
  }

  removePending(index: number) {
    const current = this.pendingTransactions();
    current.splice(index, 1);
    this.pendingTransactions.set([...current]);
  }

  async confirmAll() {
    if (isPlatformBrowser(this.platformId)) {
      const txs = this.pendingTransactions();
      for (const tx of txs) {
        await getDb().transactions.add({
          amount: tx.amount!,
          description: tx.description!,
          category: tx.category!,
          account: 'Credit Card',
          source: 'Statement',
          date: tx.date!,
          type: tx.type as 'expense' | 'income'
        });
      }
      this.router.navigate(['/transactions']);
    }
  }

  back() {
    this.router.navigate(['/transactions']);
  }
}
