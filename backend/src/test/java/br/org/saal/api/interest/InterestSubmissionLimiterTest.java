package br.org.saal.api.interest;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InterestSubmissionLimiterTest {
    @Test
    void bloqueiaAposCincoEnviosEExpiraCooldown() {
        MutableClock clock = new MutableClock(Instant.parse("2026-11-16T12:00:00Z"));
        InterestSubmissionLimiter limiter = new InterestSubmissionLimiter(clock);
        String client = "192.0.2.10";

        for (int submission = 0; submission < InterestSubmissionLimiter.MAX_SUBMISSIONS; submission++) {
            assertTrue(limiter.tryAcquire(client));
        }

        assertFalse(limiter.tryAcquire(client));
        clock.advance(InterestSubmissionLimiter.COOLDOWN.minusSeconds(1));
        assertFalse(limiter.tryAcquire(client));
        clock.advance(Duration.ofSeconds(1));
        assertTrue(limiter.tryAcquire(client));
    }

    @Test
    void enviosForaDaJanelaNaoSomamParaBloqueio() {
        MutableClock clock = new MutableClock(Instant.parse("2026-11-16T12:00:00Z"));
        InterestSubmissionLimiter limiter = new InterestSubmissionLimiter(clock);

        for (int submission = 0; submission < InterestSubmissionLimiter.MAX_SUBMISSIONS - 1; submission++) {
            assertTrue(limiter.tryAcquire("192.0.2.11"));
        }
        clock.advance(InterestSubmissionLimiter.WINDOW.plusSeconds(1));

        assertTrue(limiter.tryAcquire("192.0.2.11"));
    }

    @Test
    void clientesDiferentesNaoCompartilhamBloqueio() {
        MutableClock clock = new MutableClock(Instant.parse("2026-11-16T12:00:00Z"));
        InterestSubmissionLimiter limiter = new InterestSubmissionLimiter(clock);

        for (int submission = 0; submission < InterestSubmissionLimiter.MAX_SUBMISSIONS; submission++) {
            assertTrue(limiter.tryAcquire("192.0.2.12"));
        }

        assertFalse(limiter.tryAcquire("192.0.2.12"));
        assertTrue(limiter.tryAcquire("192.0.2.13"));
    }

    private static final class MutableClock extends Clock {
        private Instant current;

        private MutableClock(Instant current) {
            this.current = current;
        }

        private void advance(Duration duration) {
            current = current.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneId.of("UTC");
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return current;
        }
    }
}
