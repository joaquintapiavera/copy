export function* turnGenerator(game) {
    let index = game.turnIndex;
    const totalPlayers = game.playersIds.length;

    while (true) {
        const direction = game.clockwise ?1: -1;
        index = (index + direction + totalPlayers) % totalPlayers;
        yield index;
    }
}