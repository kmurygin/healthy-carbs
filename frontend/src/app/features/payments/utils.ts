import type {ActivatedRoute, ParamMap} from '@angular/router';
import {environment} from '../../../environments/environment';

export function resolveLocalOrderId(route: ActivatedRoute): string | null {
  return (
    getFromQueryParams(route) ??
    getFromLocationSearch() ??
    getFromHash() ??
    getFromSessionStorage()
  );
}

function getFromQueryParams(route: ActivatedRoute): string | null {
  const paramMap: ParamMap = route.snapshot.queryParamMap;
  return paramMap.get('localOrderId') ?? paramMap.get('extOrderId') ?? paramMap.get('orderId');
}

function getFromLocationSearch(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('localOrderId') ?? searchParams.get('extOrderId') ?? searchParams.get('orderId');
  } catch {
    return null;
  }
}

function getFromHash(): string | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash || '';
  const qIndex = hash.indexOf('?');
  if (qIndex === -1) return null;

  try {
    const searchParams = new URLSearchParams(hash.substring(qIndex));
    return searchParams.get('localOrderId') ?? searchParams.get('extOrderId') ?? searchParams.get('orderId');
  } catch {
    return null;
  }
}

function getFromSessionStorage(): string | null {
  try {
    return sessionStorage.getItem('lastLocalOrderId');
  } catch {
    return null;
  }
}

export function saveLastLocalOrderId(localOrderId: string): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('lastLocalOrderId', localOrderId);
  }
}


export function safeRemoveLastLocalOrderId(): void {
  sessionStorage.removeItem('lastLocalOrderId');
}

export function validatePayuRedirectUrl(redirectUri: string): void {
  const url = new URL(redirectUri);
  if (!environment.payuAllowedHosts.includes(url.hostname) || url.protocol !== 'https:') {
    throw new Error('Invalid redirect URL');
  }
}
