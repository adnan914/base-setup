import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const PublicRoutesGuard: CanActivateFn = (): boolean => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
    
  if (tokenService.isAuthenticated()) {
    router.navigate(['']);
    return false;
  }

  return true;
};
