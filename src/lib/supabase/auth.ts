import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/config/supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signUpWithEmail(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: 'oenomatch://auth/callback',
    },
  });
  return { data, error };
}

export async function signUpWithEmailAndPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: 'oenomatch://auth/callback' },
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  return { data, error };
}

export async function resendVerificationEmail(email: string) {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  return { data, error };
}

export async function resetPasswordForEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'oenomatch://auth/callback',
  });
  return { data, error };
}

export async function resendMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: 'oenomatch://auth/callback',
    },
  });
  return { data, error };
}

/**
 * Vérifie le code OTP (6-10 chiffres) reçu par email.
 */
export async function verifyOtpWithCode(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  return { data, error };
}

type OAuthProvider = 'google' | 'apple' | 'facebook';

export async function signInWithOAuth(provider: OAuthProvider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: Linking.createURL('/(auth)/onboarding'),
      skipBrowserRedirect: true,
    },
  });

  if (error) return { data: null, error };

  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      Linking.createURL('/(auth)/onboarding')
    );

    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);
      const params = Object.fromEntries(url.searchParams);
      if (params.access_token && params.refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        return { data: { url: result.url }, error: sessionError };
      }
    }
  }

  return { data, error };
}
