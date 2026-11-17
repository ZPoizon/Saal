package br.org.saal.api.interest;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.springframework.stereotype.Component;

/**
 * Protecao basica contra envios abusivos de manifestacoes de interesse, por cliente.
 * Em memoria de uma instancia, como o limite de login. Nao registra nem expoe PII.
 */
@Component
public class InterestSubmissionLimiter {
    static final int MAX_SUBMISSIONS = 5;
    static final int MAX_TRACKED_CLIENTS = 4096;
    static final Duration WINDOW = Duration.ofMinutes(10);
    static final Duration COOLDOWN = Duration.ofMinutes(15);

    private final Clock clock;
    private final Map<String, SubmissionState> submissionsByClient = new HashMap<>();

    public InterestSubmissionLimiter() {
        this(Clock.systemUTC());
    }

    InterestSubmissionLimiter(Clock clock) {
        this.clock = clock;
    }

    public synchronized boolean tryAcquire(String clientAddress) {
        Instant now = clock.instant();
        removeExpired(now);
        SubmissionState state = submissionsByClient.get(clientAddress);
        if (state == null) {
            if (submissionsByClient.size() >= MAX_TRACKED_CLIENTS) {
                return false;
            }
            state = new SubmissionState();
            submissionsByClient.put(clientAddress, state);
        } else if (state.blockedUntil != null && now.isBefore(state.blockedUntil)) {
            return false;
        }

        Instant cutoff = now.minus(WINDOW);
        while (!state.submissions.isEmpty() && !state.submissions.peekFirst().isAfter(cutoff)) {
            state.submissions.removeFirst();
        }
        if (state.submissions.size() >= MAX_SUBMISSIONS) {
            state.blockedUntil = now.plus(COOLDOWN);
            state.submissions.clear();
            state.lastSubmission = now;
            return false;
        }

        state.submissions.addLast(now);
        state.lastSubmission = now;
        return true;
    }

    public synchronized void clear(String clientAddress) {
        submissionsByClient.remove(clientAddress);
    }

    synchronized void clearAll() {
        submissionsByClient.clear();
    }

    private void removeExpired(Instant now) {
        Iterator<Map.Entry<String, SubmissionState>> entries = submissionsByClient.entrySet().iterator();
        while (entries.hasNext()) {
            SubmissionState state = entries.next().getValue();
            if (state.blockedUntil != null) {
                if (!now.isBefore(state.blockedUntil)) {
                    entries.remove();
                }
            } else if (state.lastSubmission != null
                    && !state.lastSubmission.isAfter(now.minus(WINDOW))) {
                entries.remove();
            }
        }
    }

    private static final class SubmissionState {
        private final ArrayDeque<Instant> submissions = new ArrayDeque<>();
        private Instant lastSubmission;
        private Instant blockedUntil;
    }
}
