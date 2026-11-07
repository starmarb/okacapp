import { Component, ElementRef, computed, inject, input, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AppointmentsService } from '@app/api/services';
import { PhotoViewer, PhotoViewerData } from '../photo-viewer/photo-viewer';
import { PhotoUploadSheet, PhotoUploadSheetData } from '../photo-upload-sheet/photo-upload-sheet';

@Component({
  imports: [MatButtonModule, MatIconModule],
  selector: 'app-photos-card',
  styleUrl: './photos-card.css',
  templateUrl: './photos-card.html',
})
export class PhotosCard {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly dialog = inject(MatDialog);

  readonly appointmentId = input.required<number>();

  readonly photos = rxResource({
    params: () => this.appointmentId(),
    stream: ({ params }) => this.appointmentsService.listPhotos({ appointment_id: params }),
  });

  readonly count = computed(() => this.photos.value()?.length ?? 0);

  private readonly strip = viewChild<ElementRef<HTMLDivElement>>('strip');

  openUpload(): void {
    this.bottomSheet
      .open<PhotoUploadSheet, PhotoUploadSheetData, boolean>(PhotoUploadSheet, {
        data: { appointmentId: this.appointmentId() },
        disableClose: true,
      })
      .afterDismissed()
      .subscribe((uploaded) => {
        if (uploaded) this.photos.reload();
      });
  }

  openViewer(index: number): void {
    const data: PhotoViewerData = { photos: this.photos.value() ?? [], index };
    this.dialog.open<PhotoViewer, PhotoViewerData>(PhotoViewer, {
      data,
      panelClass: 'photo-viewer-panel',
      backdropClass: 'photo-viewer-backdrop',
      maxWidth: '100vw',
      maxHeight: '100vh',
      ariaLabel: 'Photo viewer',
    });
  }

  scrollStrip(direction: -1 | 1): void {
    const element = this.strip()?.nativeElement;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth, behavior: 'smooth' });
  }
}
