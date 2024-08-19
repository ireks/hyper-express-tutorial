import jwt_decode from "jwt-decode";

// Typowanie dla danych, które spodziewamy się w tokenie
interface UserToken {
    exp: number; // Data wygaśnięcia tokenu
    iat: number; // Data wydania tokenu
    aud: string[]; // Odbiorcy tokenu
    sub: string; // Identyfikator użytkownika
    preferred_username: string; // Login użytkownika
    email?: string; // Opcjonalnie email
    roles: string[]; // Role przypisane użytkownikowi
    password: string; // Hasło użytkownika przechowywane w tokenie
    // Dodaj tutaj inne pola, które mogą być w tokenie
}

// Funkcja do weryfikacji tokenu i hasła
function verifyToken(token: string, expectedPassword: string): UserToken | null {
    try {
        const decodedToken = jwt_decode<UserToken>(token);

        // Sprawdzenie, czy token wygasł
        if (decodedToken.exp * 1000 < Date.now()) {
            console.warn("Token wygasł");
            return null;
        }

        // Sprawdzenie poprawności hasła
        if (decodedToken.password !== expectedPassword) {
            console.warn("Nieprawidłowe hasło");
            return null;
        }

        return decodedToken;
    } catch (error) {
        console.error("Błąd dekodowania tokenu:", error);
        return null;
    }
}

// // Przykładowe użycie funkcji
// const token = "tutaj_wstaw_token"; // Token JWT otrzymany z Keycloak
// const expectedPassword = "tutaj_wstaw_oczekiwane_haslo"; // Oczekiwane hasło

// const verifiedToken = verifyToken(token, expectedPassword);

// if (verifiedToken) {
//     console.log("Token zdekodowany i zweryfikowany:", verifiedToken);
// } else {
//     console.log("Nie udało się zdekodować tokenu, token wygasł lub hasło jest niepoprawne.");
// }
