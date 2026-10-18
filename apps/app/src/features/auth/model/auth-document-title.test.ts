import { describe, expect, it } from 'vitest';
import { authDocumentTitle } from '@/features/auth/model/auth-document-title';

const translate = (key: string) =>
  ({
    'auth.signIn.submit': 'لاگ ان کریں۔',
    'auth.signUp.submit': 'اکاؤنٹ بنائیں',
    'auth.verify.title': 'اپنے ای میل کی تصدیق کریں',
    'auth.passwordless.subtitle': 'Nibleaf پاس ورڈ کے بغیر ہے۔',
  })[key] ?? key;

describe('authDocumentTitle', () => {
  it.each([
    ['/sign-in', 'لاگ ان کریں۔ — CMS'],
    ['/sign-up', 'اکاؤنٹ بنائیں — CMS'],
    ['/verify-email', 'اپنے ای میل کی تصدیق کریں — CMS'],
    ['/forgot-password', 'Nibleaf پاس ورڈ کے بغیر ہے۔ — CMS'],
    ['/reset-password', 'Nibleaf پاس ورڈ کے بغیر ہے۔ — CMS'],
  ])('localizes %s', (pathname, expected) => {
    expect(authDocumentTitle(pathname, translate)).toBe(expected);
  });

  it('leaves unrelated routes to their own head metadata', () => {
    expect(authDocumentTitle('/pricing', translate)).toBeNull();
  });
});
