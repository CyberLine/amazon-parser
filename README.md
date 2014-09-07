amazon-parser
=============

Showing your complete Amazon order history.


About
--

JavaScript, um eine tabellarische Übersicht aller auf amazon.de getätigten Bestellungen zu erhalten.

Original Idee und Thread:
https://ngb.to/threads/1525-Amazon-Bestellungen-Exportieren-(the-hard-way)

Anleitung von hier:
http://jhein.de/2013/08/04/liste-mit-amazon-bestellungen-exportieren/

How To
--

* Auf Amazon.de einloggen
* Developer-Tools des Browsers (z.B. [Chrome](https://developer.chrome.com/devtools/docs/console), [Firefox](https://developer.mozilla.org/en-US/docs/Tools/Web_Console) oder [Safari](https://developer.apple.com/safari/tools/)) öffnen
* kompletten Inhalt des Scripts in die Javascript-Konsole kopieren
* Enter-Taste betätigen

Oder einfach das [Bookmarklet](amazonparser-bookmarket.html) verwenden.


Hinweise
--

* Im Browser müssen für amazon.de (oder generell) Popups erlaubt werden.
* Unter Firefox muss in den erweiterten Einstellungen (*about:config*) die Einstellung *dom.popup_maximum* auf einen ausreichend hohen Wert (z.B. 100) gesetzt werden.
* Achtung! Das ist nichts für schwache Rechner. Je nach Umfang der Bestellhistorie werden dutzende Tabs/Fenster geöffnet und deren Inhalt gecrawlt. Bei einer extrem umfangreichen Bestellhistorie kann der Browser durchaus auch abstürzen.
* Dieses Skript funktioniert nicht unter IE. Chrome 37 stürzt mitten in der Durchführung ab. Mit Chrome 35 hat es noch funktioniert.