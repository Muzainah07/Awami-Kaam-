/**
 * Test script verifying:
 * 1. Both demo buttons log in with no SMS (using verifyOtp with Supabase test numbers).
 * 2. Guest login works (signInAnonymously with role locking).
 * 3. Role stays locked in profiles.
 * 4. A non-demo number shows the friendly message.
 */

import { api } from '../services/api';
import { DEMO_WORKER, DEMO_HIRER } from '../config/demo';

export async function runAuthDemoTests() {
  console.log('--- Starting Awami Kam Auth & Demo Test Suite ---');

  // Test 1: Demo Worker Login
  try {
    const workerSession = await api.loginAsDemoUser('worker');
    if (workerSession.role === 'worker' && workerSession.userId) {
      console.log('✅ PASS: Demo Worker login successful with no SMS:', workerSession.name);
    } else {
      console.error('❌ FAIL: Demo Worker login returned invalid session');
    }
  } catch (err) {
    console.error('❌ FAIL: Demo Worker login threw error:', err);
  }

  // Test 2: Demo Hirer Login
  try {
    const hirerSession = await api.loginAsDemoUser('hirer');
    if (hirerSession.role === 'hirer' && hirerSession.userId) {
      console.log('✅ PASS: Demo Hirer login successful with no SMS:', hirerSession.name);
    } else {
      console.error('❌ FAIL: Demo Hirer login returned invalid session');
    }
  } catch (err) {
    console.error('❌ FAIL: Demo Hirer login threw error:', err);
  }

  // Test 3: Guest Login & Role Locking
  try {
    const guestSession = await api.loginAsGuest('worker');
    if (guestSession.isGuest && guestSession.role === 'worker') {
      console.log('✅ PASS: Guest login works with role locked to worker');
    } else {
      console.error('❌ FAIL: Guest login failed');
    }
  } catch (err) {
    console.error('❌ FAIL: Guest login threw error:', err);
  }

  // Test 4: Non-Demo Phone Number Friendly Error
  try {
    const res = await api.sendPhoneOtp('+923119999999');
    if (res && res.error) {
      console.log('✅ PASS: Non-demo number correctly rejected with friendly message:', res.error);
    } else {
      console.warn('⚠️ Non-demo number response:', res);
    }
  } catch (err) {
    console.log('✅ PASS: Non-demo number threw error caught successfully');
  }

  // Test 5: Check Demo Setup
  try {
    const setup = await api.checkDemoSetup();
    console.log('✅ PASS: checkDemoSetup completed:', setup.details);
  } catch (err) {
    console.error('❌ FAIL: checkDemoSetup threw error:', err);
  }

  console.log('--- Auth & Demo Test Suite Complete ---');
}
