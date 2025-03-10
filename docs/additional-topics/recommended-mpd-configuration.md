---
layout: page
permalink: /additional-topics/recommended-mpd-configuration
title: Recommended MPD configuration
---

myMPD needs the following mpd settings for all features. If a feature is not enabled in mpd, myMPD disables the associated features.

```
# Enable stickers - myMPD uses stickers for play statistics
sticker_file            "/var/lib/mpd/sticker.sql"

# Enable stored playlists, also needed for myMPD smart playlists
playlist_directory      "/var/lib/mpd/playlists"

# Enable metadata. If set to none, you can only browse the filesystem
# Enable also the musicbrainz_* tags if you want integration with MusicBrainz and ListenBrainz
metadata_to_use         "AlbumArtist,Artist,Album,Title,Track,Disc,Genre,Name"

# bind mpd to a unix socket
bind_to_address         "/run/mpd/socket"

# Mounting is only possible with the simple database plugin and a cache_directory
database {
        plugin          "simple"
        path            "/var/lib/mpd/tag_cache"
        cache_directory "/var/lib/mpd/cache"
}

# Enable neighbor plugins
neighbors {
        plugin          "udisks"
}
neighbors {
        plugin          "upnp"
}

# Ouput for http stream - myMPD local playback
audio_output {
	type		"httpd"
	name		"HTTP Stream"
	encoder		"lame" #to support safari on ios
	port		"8000"
	bitrate		"128"
	format		"44100:16:1"
	always_on   "yes"
	tags        "yes"
}
```
