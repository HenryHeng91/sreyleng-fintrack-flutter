import { Routes } from '@angular/router';
import { TransactionsComponent } from './transactions';
import { DashboardComponent } from './dashboard';
import { AddTransactionComponent } from './add-transaction';
import { TransactionDetailComponent } from './transaction-detail';
import { StatementOcrComponent } from './statement-ocr';

export const routes: Routes = [
  { path: '', redirectTo: 'transactions', pathMatch: 'full' },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'transaction/:id', component: TransactionDetailComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'add', component: AddTransactionComponent },
  { path: 'statement-ocr', component: StatementOcrComponent },
  { path: 'accounts', component: DashboardComponent }, // Placeholder
  { path: 'settings', component: DashboardComponent }, // Placeholder
];
