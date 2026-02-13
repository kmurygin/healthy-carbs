package org.kmurygin.healthycarbs.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@org.springframework.context.annotation.Profile("!test")
public class SecurityConfig {

    private static final long HSTS_MAX_AGE_SECONDS = 365L * 24 * 60 * 60; // 1 year

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final RateLimitFilter rateLimitFilter;
    private final AuthenticationProvider authenticationProvider;

    @Value("${application.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Value("${springdoc.swagger-enabled:false}")
    private boolean swaggerEnabled;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                // CSRF disabled: this is a stateless JWT API — no cookies, so no CSRF risk
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> {
                    headers.contentTypeOptions(Customizer.withDefaults());
                    headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::deny);
                    headers.httpStrictTransportSecurity(hsts -> hsts
                            .includeSubDomains(true)
                            .preload(true)
                            .maxAgeInSeconds(HSTS_MAX_AGE_SECONDS)
                    );
                    headers.permissionsPolicyHeader(permissions -> permissions
                            .policy("geolocation=(), camera=(), microphone=()")
                    );
                    headers.referrerPolicy(Customizer.withDefaults());
                })
                .authorizeHttpRequests(authorizeRequests -> {
                    if (swaggerEnabled) {
                        authorizeRequests
                                .requestMatchers("/swagger-ui/**").permitAll()
                                .requestMatchers("/v3/api-docs/**").permitAll()
                                .requestMatchers("/swagger-resources/**").permitAll()
                                .requestMatchers("/swagger-ui.html").permitAll();
                    }
                    authorizeRequests
                            .requestMatchers(HttpMethod.POST, "/api/v1/auth/register").permitAll()
                            .requestMatchers(HttpMethod.POST, "/api/v1/auth/authenticate").permitAll()
                            .requestMatchers(HttpMethod.POST, "/api/v1/auth/forgot-password").permitAll()
                            .requestMatchers(HttpMethod.POST, "/api/v1/auth/verify-otp").permitAll()
                            .requestMatchers(HttpMethod.POST, "/api/v1/auth/reset-password").permitAll()
                            .requestMatchers(HttpMethod.POST, "/api/v1/payments/payu/notify").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/v1/payments/payu/continue").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/v1/blog/images/**").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/v1/users/*/image").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/v1/files/**").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/v1/diet-types").permitAll()
                            .anyRequest().authenticated();
                })
                .sessionManagement(sessionManagement ->
                        sessionManagement
                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration corsConfiguration = new CorsConfiguration();

        corsConfiguration.setAllowedOrigins(allowedOrigins);
        corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH",
                "DELETE", "OPTIONS"));
        corsConfiguration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        corsConfiguration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/api/**", corsConfiguration);
        return src;
    }
}
