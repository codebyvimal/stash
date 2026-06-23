import { renderHook, act } from '@testing-library/react';
import { useStore, useStoreBase } from './useStore';
import { beforeEach, describe, it, expect } from 'vitest';

describe('useStore', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useStoreBase.getState().clearAll();
    });
  });

  it('should initialize with empty data if localStorage is empty', () => {
    const { result } = renderHook(() => useStore());
    expect(result.current.transactions.length).toBe(3);
    expect(result.current.rewards.length).toBe(6);
    expect(result.current.settings).toEqual({ daily_goal: 500, currency_name: 'pts' });
    expect(result.current.balance).toBe(450);
    expect(result.current.dailyEarned).toBe(600);
  });

  it('should add a transaction and update balance and dailyEarned', () => {
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.addTransaction({
        title: 'Test earn',
        pts: 100,
        type: 'earn'
      });
    });

    expect(result.current.transactions.length).toBe(4);
    expect(result.current.transactions[3].title).toBe('Test earn');
    expect(result.current.transactions[3].pts).toBe(100);
    expect(result.current.transactions[3].type).toBe('earn');
    expect(result.current.balance).toBe(550);
    expect(result.current.dailyEarned).toBe(700);
  });

  it('should add a reward', () => {
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.addReward({
        title: 'Test Reward',
        pts: 50,
        category: 'Test'
      });
    });

    expect(result.current.rewards.length).toBe(7);
    const newReward = result.current.rewards[6];
    expect(newReward.title).toBe('Test Reward');
    expect(newReward.pts).toBe(50);
  });

  it('should claim a reward, deduct from balance and add a spend transaction', () => {
    const { result } = renderHook(() => useStore());
    
    // First earn some points
    act(() => {
      result.current.addTransaction({
        title: 'Initial earn',
        pts: 100,
        type: 'earn'
      });
    });
    
    // Add a reward to claim
    act(() => {
      result.current.addReward({
        title: 'Test Reward',
        pts: 50,
        category: 'Test'
      });
    });

    const rewardId = result.current.rewards[6].id;

    // Claim the reward
    act(() => {
      result.current.claimReward(rewardId);
    });

    expect(result.current.balance).toBe(500);
    expect(result.current.transactions.length).toBe(5);
    const spendTx = result.current.transactions.find(t => t.type === 'spend' && t.reward_id === rewardId);
    expect(spendTx).toBeDefined();
    expect(spendTx?.pts).toBe(50);
    expect(spendTx?.reward_id).toBe(rewardId);
  });
});
