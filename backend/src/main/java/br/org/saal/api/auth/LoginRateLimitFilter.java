package br.org.saal.api.auth;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.filter.OncePerRequestFilter;

final class LoginRateLimitFilter extends OncePerRequestFilter {
    private static final String LOGIN_PATH = "/api/v1/auth/login";
    private final LoginAttemptLimiter limiter;

    LoginRateLimitFilter(LoginAttemptLimiter limiter) {
        this.limiter = limiter;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if ("POST".equals(request.getMethod())
                && LOGIN_PATH.equals(request.getServletPath())
                && limiter.isBlocked(request.getRemoteAddr())) {
            response.setStatus(429);
            response.setHeader("Retry-After", "900");
            response.setContentType("application/problem+json");
            response.getWriter().write(
                    "{\"type\":\"about:blank\",\"title\":\"Muitas tentativas\",\"status\":429}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
