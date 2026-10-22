---
title: Emulators inherit the host's DNS, so GCS media can hang with no error
added: 2026-10-22
updated: 2026-10-22
by: aquib N
---

Any app here that plays media straight from storage.googleapis.com makes the device resolve a third-party name. An Android emulator takes the HOST machine's resolver list at launch. If the host's first resolver cannot resolve public names from inside the guest — a router address like 192.168.1.99 is the common case — the lookup STALLS INDEFINITELY rather than failing.

Nothing errors. The player sits black, a thumbnail never appears, a promise never settles so its catch never runs. It reads exactly like a broken player, and it is not.

Diagnosed 2026-10-22 on music-jetkreate-mobile after it was mistaken for a player bug for days.

Spotting it: 'adb shell ping -c 2 storage.googleapis.com'. Unknown host or a hang means DNS, not your code.

Fixing the environment: put a public resolver FIRST on the host (macOS: System Settings - Wi-Fi - Details - DNS; adding any server by hand drops the DHCP ones, so add the router back as the second entry), then COLD BOOT the AVD — DNS is read at launch, and a snapshot resume keeps the old state. Launching with '-dns-server 8.8.8.8' does the same for one session. Note the emulator's Extended Controls has NO DNS setting; its Proxy tab is an HTTP proxy and will not help.

Fixing it properly: JET-194 asks music-jetkreate-backend to serve media from its own host, so no client resolves a third party at all. A 302 to GCS does NOT count — the client still has to resolve GCS to follow it.

Worth doing in any client regardless: bound every media load with a deadline. An unreachable host should say so in seconds, not hang. See music-jetkreate-mobile src/lib/media-timeout.ts.
