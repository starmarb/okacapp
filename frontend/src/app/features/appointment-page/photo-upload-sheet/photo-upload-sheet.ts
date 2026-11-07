import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppointmentsService } from '@app/api/services';
import { firstValueFrom } from 'rxjs';

export interface PhotoUploadSheetData {
  appointmentId: number;
}

interface UploadProgress {
  done: number;
  total: number;
}

const ACCEPTED = 'image/jpeg,image/png,image/webp';

@Component({
  imports: [MatButtonModule, MatIconModule],
  selector: 'app-photo-upload-sheet',
  styleUrl: './photo-upload-sheet.css',
  templateUrl: './photo-upload-sheet.html',
})
export class PhotoUploadSheet {
  protected readonly accept = ACCEPTED;

  private readonly appointmentsService = inject(AppointmentsService);
  private readonly sheetRef =
    inject<MatBottomSheetRef<PhotoUploadSheet, boolean>>(MatBottomSheetRef);
  readonly data = inject<PhotoUploadSheetData>(MAT_BOTTOM_SHEET_DATA);

  private readonly cameraInput =
    viewChild.required<ElementRef<HTMLInputElement>>('cameraInput');
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  readonly uploading = signal(false);
  readonly progress = signal<UploadProgress>({ done: 0, total: 0 });
  readonly error = signal<string | null>(null);

  takePhoto(): void {
    this.cameraInput().nativeElement.click();
  }

  chooseFiles(): void {
    this.fileInput().nativeElement.click();
  }

  async onFiles(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;

    this.error.set(null);
    this.uploading.set(true);
    this.progress.set({ done: 0, total: files.length });

    let uploaded = 0;

    for (const file of files) {
      try {
        await firstValueFrom(
          this.appointmentsService.addPhoto({
            appointment_id: this.data.appointmentId,
            body: { file },
          }),
        );
        uploaded += 1;
        this.progress.set({ done: uploaded, total: files.length });
      } catch {
        this.error.set(`Couldn’t upload ${file.name}`);
        break;
      }
    }

    this.uploading.set(false);

    // Reload the card if anything made it in; otherwise stay open to show why not.
    if (uploaded > 0) this.sheetRef.dismiss(true);
  }

  cancel(): void {
    this.sheetRef.dismiss(false);
  }
}
