/**
 * AsyncMutex — Concurrency guard for Lira's dual-activation system.
 *
 * Uses a non-blocking tryAcquire() pattern so that competing triggers
 * (tap + wake word) are silently dropped rather than queued.
 * This eliminates the race window where both activations could fire.
 */
export class AsyncMutex {
    private locked = false

    /**
     * Non-blocking attempt to acquire the lock.
     * Returns true if acquired, false if already locked.
     * This is the ONLY safe way to acquire in the activation path —
     * never use a blocking acquire() which could queue a stale trigger.
     */
    tryAcquire(): boolean {
        if (this.locked) return false
        this.locked = true
        return true
    }

    /** Always call in a finally{} block — unconditionally releases the lock. */
    release(): void {
        this.locked = false
    }

    get isLocked(): boolean {
        return this.locked
    }
}
