import { Component, computed, inject, linkedSignal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PhotoOut } from '@app/api/models';

export interface PhotoViewerData {
  photos: PhotoOut[];
  index: number;
}

@Component({
  imports: [MatIconModule],
  selector: 'app-photo-viewer',
  styleUrl: './photo-viewer.css',
  templateUrl: './photo-viewer.html',
  host: {
    class: 'block h-full w-full',
    '(document:keydown.arrowleft)': 'prev()',
    '(document:keydown.arrowright)': 'next()',
  },
})
export class PhotoViewer {
  private readonly dialogRef = inject<MatDialogRef<PhotoViewer>>(MatDialogRef);
  readonly data = inject<PhotoViewerData>(MAT_DIALOG_DATA);

  /** Synced from the opening index, then updated by navigation. */
  readonly index = linkedSignal(() => this.data.index);
  readonly current = computed(() => this.data.photos[this.index()] ?? null);

  close(): void {
    this.dialogRef.close();
  }

  prev(): void {
    this.index.update((value) => Math.max(0, value - 1));
  }

  next(): void {
    this.index.update((value) => Math.min(this.data.photos.length - 1, value + 1));
  }
}
