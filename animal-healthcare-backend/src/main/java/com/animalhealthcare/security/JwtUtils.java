package com.animalhealthcare.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.logging.Logger;

@Component
public class JwtUtils {
    
    private static final Logger logger = Logger.getLogger(JwtUtils.class.getName());
    
    @Value("${app.jwtSecret:animalHealthcareSecretKey}")
    private String jwtSecret;
    
    @Value("${app.jwtExpirationMs:86400000}")
    private int jwtExpirationMs;
    
    public String generateJwtToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    
    public String generateTokenFromUsername(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    
    public String getUsernameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.severe("Invalid JWT token: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.severe("JWT token is expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.severe("JWT token is unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.severe("JWT claims string is empty: " + e.getMessage());
        }
        return false;
    }
    
    private SecretKey getSigningKey() {
        try {
            // Try to decode as Base64 first
            byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (IllegalArgumentException e) {
            // If not valid Base64, use the string directly but ensure it's long enough
            byte[] keyBytes = jwtSecret.getBytes();
            if (keyBytes.length < 64) {
                // Pad the key to meet minimum requirements for HS512
                String paddedSecret = jwtSecret;
                while (paddedSecret.length() < 64) {
                    paddedSecret += jwtSecret;
                }
                keyBytes = paddedSecret.substring(0, 64).getBytes();
            }
            return Keys.hmacShaKeyFor(keyBytes);
        }
    }
}
