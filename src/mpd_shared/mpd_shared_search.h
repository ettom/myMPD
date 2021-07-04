/*
 SPDX-License-Identifier: GPL-2.0-or-later
 myMPD (c) 2018-2021 Juergen Mang <mail@jcgames.de>
 https://github.com/jcorporation/mympd
*/

#ifndef __MPD_SHARED_SEARCH_H__
#define __MPD_SHARED_SEARCH_H__
sds mpd_shared_search(struct t_mpd_state *mympd_state, sds buffer, sds method, long request_id,
                      const char *searchstr, const char *searchtag, const char *plist, 
                      const unsigned int offset, unsigned int limit, const struct t_tags *tagcols,
                      rax *sticker_cache);

sds mpd_shared_search_adv(struct t_mpd_state *mympd_state, sds buffer, sds method, long request_id,
                          const char *expression, const char *sort, const bool sortdesc, 
                          const char *grouptag, const char *plist, const unsigned int offset,
                          unsigned int limit, const struct t_tags *tagcols, rax *sticker_cache);

sds escape_mpd_search_expression(sds buffer, const char *tag, const char *operator, const char *value);
#endif
