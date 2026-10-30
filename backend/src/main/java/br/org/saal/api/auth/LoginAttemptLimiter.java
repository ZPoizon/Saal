package br.org.saal.api.auth;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class LoginAttemptLimiter {
    static final int MAX_FAILURES = 10;
    static final int MAX_TRACKED_CLIENTS = 4096;
    static final Duration WINDOW = Duration.ofMinutes(10);
    static final Duration COOLDOWN = Duration.ofMinutes(15);

    private final Clock clock;
    private final Map<String, FailureState> failuresByClient = new HashMap<>();

    public LoginAttemptLimiter() {
        this(Clock.systemUTC());
    }

    LoginAttemptLimiter(Clock clock) {
        this.clock = clock;
    }

    public synchronized boolean isBlocked(String clientAddress) {
        Instant now = clock.instant();
        removeExpired(now);
        FailureState state = failuresByClient.get(clientAddress);
        if (state == null) {
            return failuresByClient.size() >= MAX_TRACKED_CLIENTS;
        }
        if (state.blockedUntil != null && now.isBefore(state.blockedUntil)) {
            return true;
        }
        if (state.blockedUntil != null) {
            failuresByClient.remove(clientAddress);
        }
        return false;
    }

    public synchronized void recordFailure(String clientAddress) {
        Instant now = clock.instant();
        removeExpired(now);
        FailureState state = failuresByClient.get(clientAddress);
        if (state == null) {
            if (failuresByClient.size() >= MAX_TRACKED_CLIENTS) {
                return;
            }
            state = new FailureState();
            failuresByClient.put(clientAddress, state);
        }

        Instant cutoff = now.minus(WINDOW);
        while (!state.failures.isEmpty() && !state.failures.peekFirst().isAfter(cutoff)) {
            state.failures.removeFirst();
        }
        state.failures.addLast(now);
        state.lastFailure = now;
        if (state.failures.size() >= MAX_FAILURES) {
            state.blockedUntil = now.plus(COOLDOWN);
            state.failures.clear();
        }
    }

    public synchronized void clear(String clientAddress) {
        failuresByClient.remove(clientAddress);
    }

    synchronized void clearAll() {
        failuresByClient.clear();
    }

    private void removeExpired(Instant now) {
        Iterator<Map.Entry<String, FailureState>> entries = failuresByClient.entrySet().iterator();
        while (entries.hasNext()) {
            FailureState state = entries.next().getValue();
            if (state.blockedUntil != null) {
                if (!now.isBefore(state.blockedUntil)) {
                    entries.remove();
                }
            } else if (state.lastFailure != null && !state.lastFailure.isAfter(now.minus(WINDOW))) {
                entries.remove();
            }
        }
    }

    private static final class FailureState {
        private final ArrayDeque<Instant> failures = new ArrayDeque<>();
        private Instant lastFailure;
        private Instant blockedUntil;
    }
}
