# Super Castle Game

> An open mind is like a fortress with its gates unbarred and unguarded.

[Play Super Castle Game][play] ・ [Community Levels][lvl]

*Super Castle Game* uses [natlib][nat], a highly composable library for small games.

Written by [Mark Vasilkov][rei] for js13kGames in 2023.

Released under the [GNU General Public License version 3][gpl].

---

This is a game about building a castle. Magnificent and sempiternal, the fortress of the mind will rise — and it begins with a single block.

Set in the 13th century, *Super Castle Game* immerses you in a captivating medieval fantasy world of some description.

## How to play

- Arrow keys or WASD (and R to restart the level)
- Tap on the screen
- Gamepad left analog stick (and B to restart the level)

The icons are: toggle audio, restart the level, and level select.

For best experience on Android, use the 'Add to Home screen' feature. Seriously, it's amazing how much better the game runs if started from that shortcut.

Thank you for playing!

## Disclaimer

The author of this work does not condone the repackaging of "Super Castle Game" as any kind of NFT or blockchain-related product. The use of this work for such purposes is not supported by the author and may result in unintended consequences. Consider yourself disclaimed.

## Installation

```bash
cd super2023
python3 -m venv virtual
. ./virtual/bin/activate
python -m pip install -U pip
pip install -r requirements.txt
yarn
```

## How to build

```bash
./build.sh
open build/index.html
```

## Acknowledgements

- [Solar Icons][sol] by 480 Design, licensed under CC BY 4.0

[play]: https://js13kgames.com/games/super-castle-game/index.html
[lvl]: https://github.com/mvasilkov/super2023/tree/master/levels
[nat]: https://github.com/mvasilkov/natlib
[rei]: https://github.com/mvasilkov
[gpl]: https://github.com/mvasilkov/super2023/blob/master/LICENSE
[sol]: https://www.figma.com/community/file/1166831539721848736
