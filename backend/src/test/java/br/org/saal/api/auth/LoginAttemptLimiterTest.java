package br.org.saal.api.auth;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LoginAttemptLimiterTest {
    @Test
    void bloqueiaApenasAposDezFalhasEExpiraCooldown() {
        MutableClock clock = new MutableClock(Instant.parse("2026-10-29T12:00:00Z"));
        LoginAttemptLimiter limiter = new LoginAttemptLimiter(clock);
        String client = "192.0.2.1";

        for (int attempt = 0; attempt < LoginAttemptLimiter.MAX_FAILURES; attempt++) {
            assertFalse(limiter.isBlocked(client));
            limiter.recordFailure(client);
        }

        assertTrue(limiter.isBlocked(client));
        clock.advance(LoginAttemptLimiter.COOLDOWN.minusSeconds(1));
        assertTrue(limiter.isBlocked(client));
        clock.advance(Duration.ofSeconds(1));
        assertFalse(limiter.isBlocked(client));
    }

    @Test
    void tentativasForaDaJanelaNaoSomamParaBloqueio() {
        MutableClock clock = new MutableClock(Instant.parse("2026-10-29T12:00:00Z"));
        LoginAttemptLimiter limiter = new LoginAttemptLimiter(clock);

        for (int attempt = 0; attempt < LoginAttemptLimiter.MAX_FAILURES - 1; attempt++) {
            limiter.recordFailure("192.0.2.2");
        }
        clock.advance(LoginAttemptLimiter.WINDOW.plusSeconds(1));
        limiter.recordFailure("192.0.2.2");

        assertFalse(limiter.isBlocked("192.0.2.2"));
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
