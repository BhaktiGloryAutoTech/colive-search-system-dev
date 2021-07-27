import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ToastDisplay implements OnDestroy {
  intervalForToastrPosition: any;
  public toastDetails;

  constructor(private router: Router, private toastr: ToastrService) {
    toastr.toastrConfig.preventDuplicates = true;
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalForToastrPosition);
  }

  showSuccess(msg) {
    this.toastDetails = this.toastr.success(msg, 'Success', { enableHtml: true });
  }

  showError(msg) {
    this.toastr.error(msg, 'Error', { enableHtml: true});
  }

  showWarning(msg) {
    this.toastr.warning(msg, 'Warning', { enableHtml: true });
  }


  showInformation(msg){
    this.toastr.info(msg, 'Informational', { enableHtml: true});
  }

  closeToast() {
    if (this.toastDetails && this.toastDetails.toastId) {
      this.toastr.clear(this.toastDetails.toastId);
    }
  }
}
