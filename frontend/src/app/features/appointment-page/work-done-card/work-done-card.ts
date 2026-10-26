import { Component, DestroyRef, inject, input, linkedSignal, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AppointmentOut } from '@app/api/models';
import { AppointmentsService } from '@app/api/services';

const SAVE_DEBOUNCE_MS = 1500;

type SaveStatus = 'pending' | 'saving' | 'saved' | 'error';

@Component({
  imports: [MatIconModule, MatInputModule],
  selector: 'app-work-done-card',
  styleUrl: './work-done-card.css',
  templateUrl: './work-done-card.html',
})
export class WorkDoneCard {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly appointment = input.required<AppointmentOut>();

  // Editable copy of the saved value; resets when the appointment input changes.
  readonly work_done = linkedSignal(() => this.appointment().work_done);

  // Last value successfully persisted, used to skip no-op PATCHes.
  private readonly last_saved = linkedSignal(() => this.appointment().work_done);

  readonly saveStatus = signal<SaveStatus>('saved');

  private saveTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.saveTimer));
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.work_done.set(value);

    clearTimeout(this.saveTimer);

    if (value === this.last_saved()) {
      this.saveStatus.set('saved');
      return;
    }

    this.saveStatus.set('pending');
    this.saveTimer = setTimeout(() => this.save(), SAVE_DEBOUNCE_MS);
  }

  save(): void {
    clearTimeout(this.saveTimer);
    this.saveTimer = undefined;

    const value = this.work_done();
    if (value === this.last_saved()) {
      this.saveStatus.set('saved');
      return;
    }

    this.saveStatus.set('saving');
    this.appointmentsService
      .patchAppointment({
        appointment_id: this.appointment().id,
        body: { work_done: value },
      })
      .subscribe({
        next: () => {
          this.last_saved.set(value);
          // Don't overwrite a newer pending edit.
          if (this.work_done() === value) {
            this.saveStatus.set('saved');
          }
        },
        error: () => {
          if (this.work_done() === value) {
            this.saveStatus.set('error');
          }
        },
      });
  }
}
