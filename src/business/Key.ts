export enum Key {
    D0            = 48,
    D1            = 49,
    D2            = 50,
    D3            = 51,
    D4            = 52,
    D5            = 53,
    D6            = 54,
    D7            = 55,
    D8            = 56,
    D9            = 57,
    A             = 65,
    B             = 66,
    C             = 67,
    D             = 68,
    E             = 69,
    F             = 70,
    G             = 71,
    H             = 72,
    I             = 73,
    J             = 74,
    K             = 75,
    L             = 76,
    M             = 77,
    N             = 78,
    O             = 79,
    P             = 80,
    Q             = 81,
    R             = 82,
    S             = 83,
    T             = 84,
    U             = 85,
    V             = 86,
    W             = 87,
    X             = 88,
    Y             = 89,
    Z             = 90,
    Space         = 32,
    Multiply      = 106,
    Add           = 107,
    Subtract      = 109,
    Decimal       = 110,
    Divide        = 111,
    Semicolon     = 186,
    EqualsPlus    = 187,
    Comma         = 188,
    Minus         = 189,
    Period        = 190,
    Question      = 191,
    Tilde         = 192,
    OpenBrackets  = 219,
    Pipe          = 220,
    CloseBrackets = 221,
    Quotes        = 222,
    Backslash     = 226,
}

export function getKeyName(key: Key): string {
    const names: { [key: number]: string } = {
        [Key.D0]: 'D0', [Key.D1]: 'D1', [Key.D2]: 'D2', [Key.D3]: 'D3', [Key.D4]: 'D4',
        [Key.D5]: 'D5', [Key.D6]: 'D6', [Key.D7]: 'D7', [Key.D8]: 'D8', [Key.D9]: 'D9',
        [Key.Space]: 'Space',
        [Key.Semicolon]: ';', [Key.EqualsPlus]: '=', [Key.Comma]: ',',
        [Key.Minus]: '-', [Key.Period]: '.', [Key.Question]: '/',
        [Key.Tilde]: '`', [Key.OpenBrackets]: '[', [Key.Pipe]: '\\',
        [Key.CloseBrackets]: ']', [Key.Quotes]: '\'', [Key.Backslash]: '\\',
        [Key.Multiply]: 'Num *', [Key.Add]: 'Num +', [Key.Subtract]: 'Num -',
        [Key.Decimal]: 'Num .', [Key.Divide]: 'Num /',
    };

    if (key in names) {
        return names[key];
    }

    if (key >= Key.A && key <= Key.Z) {
        return String.fromCharCode(key);
    }

    return 'Unknown';
}

export function keyFromVSCodeKeyCode(keyCode: number): Key | null {
    const numericKeys: { [key: number]: Key } = {
        48: Key.D0, 49: Key.D1, 50: Key.D2, 51: Key.D3, 52: Key.D4,
        53: Key.D5, 54: Key.D6, 55: Key.D7, 56: Key.D8, 57: Key.D9,
        65: Key.A, 66: Key.B, 67: Key.C, 68: Key.D, 69: Key.E,
        70: Key.F, 71: Key.G, 72: Key.H, 73: Key.I, 74: Key.J,
        75: Key.K, 76: Key.L, 77: Key.M, 78: Key.N, 79: Key.O,
        80: Key.P, 81: Key.Q, 82: Key.R, 83: Key.S, 84: Key.T,
        85: Key.U, 86: Key.V, 87: Key.W, 88: Key.X, 89: Key.Y, 90: Key.Z,
    };

    if (keyCode in numericKeys) {
        return numericKeys[keyCode];
    }

    if (Object.values(Key).includes(keyCode as Key)) {
        return keyCode as Key;
    }

    return null;
}
