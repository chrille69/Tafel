# Endlostafel für das digitale Klassenzimmer
Eine einfache Schreibfläche für digitale Tafeln mit nützlichen Extras für den Unterricht.

Diese Open-Source Softwarelösung unterliegt der MIT-Lizenz.

## Hintergrund
Eine digitale Tafel besteht aus zwei Hardware-Komponenten:
* einen Beamer oder Touchbildschirm (Display) mit Stift oder Touchfunktion und
* einem PC.

Das Display fungiert einerseits als Anzeigegerät und andererseits als Eingabegerät (Maus) für den PC.
Daher ist das Display mit USB  und mit HDMI oder DP verbunden.
Alternativ gibt es auch Lösungen, bei dem die Displays mit dem Rechner über das Netzwerk (LAN) kommunizieren. 

## Funktionsumfang
Dieses Programm stellt eine möglichst große Schreibfläche für den Unterricht zur Verfügung.
Es wurde so konzipiert, dass alle Funktionen mit Klicks ausgeführt werden können, weil man
als Lehrer an der Tafel steht und währenddessen keine gleichzeitigen Tastatureingaben tätigen kann
(Shift- oder Strg-Tasten).
Die Menge an implementierten Funktionen sind auf ein Nötigstes reduziert. Man bedenke immer, dass die
Schüler ein Heft und einen Stift in der Hand haben. Ein Verschieben der Objekte (o.ä.)
sollte daher vermieden werden.

Es ist kein Zeichenprogramm! Wer mehr Funktionen möchte, erstelle sich z.B. mit Inkscape wunderschöne
Grafiken.

Folgende Funktionen stehen zur Verfügung:

* Hell- und Dunkelmodus
* Vollbildschirm
* Vier vordefinierte Farben
* Vier vordefinierte Stiftgrößen
* Linien
* Pfeile
* Einfache geometrische Formen wie Kreise, Ellipsen, Quadrate und Rechtecke
* Kariertes Papier, liniertes Papier, Logarithmuspapier, Millimeterpapier
* Einblenden eines Geodreiecks mit Snap-Funktion
* Verschieben und Löschen einzelner Elemente
* Speichern der Inhalte als SVG-Dateien
* Speichern der Inhalte als JSON-Datei, damit die Elemente wieder geladen werden können
* Laden von SVGs und Bitmaps
* Einfügen der Zwischenablage als Grafik
* Zoomen einzelner Elemente oder der gesamten Zeichenfläche

## Technische Details

Das Programm nutzt das Framework Vue (https://vuejs.org/), VueUse (https://vueuse.org/), das grafische
Benutzerzwischengesicht (GUI) Quasar (https://quasar.dev/) und die beiden Tools movable (https://daybrush.com/moveable/)
sowie selecto (https://daybrush.com/selecto).

## Über den Autor
Ich bin Physik- und Mathematiklehrer an der Lise-Meitner-Schule in Berlin.
