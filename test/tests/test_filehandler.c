/*
 SPDX-License-Identifier: GPL-3.0-or-later
 myMPD (c) 2018-2022 Juergen Mang <mail@jcgames.de>
 https://github.com/jcorporation/mympd
*/

#include "compile_time.h"
#include "../utility.h"

#include "../../dist/utest/utest.h"
#include "../../src/lib/filehandler.h"
#include "../../src/lib/sds_extras.h"

UTEST(filehandler, test_cleanup_rm_directory) {
    int rc = testdir("/tmp/mympd-test/tmp2", "/tmp/mympd-test/tmp2", true);
    ASSERT_EQ(rc, DIR_CREATED);
    bool rc2 = clean_rm_directory("/tmp/mympd-test/tmp2");
    ASSERT_TRUE(rc2);
}

UTEST(filehandler, test_testdir) {
    int rc = testdir("workdir", workdir, false);
    ASSERT_EQ(rc, DIR_EXISTS);

    rc = testdir("/tmp/mympd-test/tmp2", "/tmp/mympd-test/tmp2", false);
    ASSERT_EQ(rc, DIR_NOT_EXISTS);

    rc = testdir("/tmp/mympd-test/tmp2", "/tmp/mympd-test/tmp2", true);
    ASSERT_EQ(rc, DIR_CREATED);
    rmdir("/tmp/mympd-test/tmp2");

    rc = testdir("/tmp/mympd-test/tmp2/tmp2", "/tmp/mympd-test/tmp2/tmp2", true);
    ASSERT_EQ(rc, DIR_CREATE_FAILED);
}

UTEST(filehandler, test_write_data_to_file) {
    sds file = sdsnew("/tmp/mympd-test/state/test");
    const char *data ="asdfjlkasdfjklsafd\nasfdsdfawaerwer\n";
    size_t len = strlen(data);
    bool rc = write_data_to_file(file, data, len);
    ASSERT_TRUE(rc);
    sdsfree(file);
}

UTEST(filehandler, test_testfile_read) {
    sds file  = sdsnew("/tmp/mympd-test/state/test");
    bool rc = testfile_read(file);
    ASSERT_TRUE(rc);
    sdsclear(file);
    file = sdscat(file, "/tmp/mympd-test/state/test-notexist");
    rc = testfile_read(file);
    ASSERT_FALSE(rc);
    sdsfree(file);
}

UTEST(sds_extras, test_sds_getfile) {
    sds line = sdsempty();
    FILE *fp = fopen("/tmp/mympd-test/state/test", "r");
    int rc = sds_getfile(&line, fp, 1000);
    fclose(fp);
    ASSERT_EQ(rc, 0);
    ASSERT_STREQ(line, "asdfjlkasdfjklsafd\nasfdsdfawaerwer");

    fp = fopen("/tmp/mympd-test/state/test", "r");
    rc = sds_getfile(&line, fp, 5);
    fclose(fp);
    ASSERT_EQ(rc, -2);
    sdsfree(line);
}

UTEST(sds_extras, test_sds_getline) {
    sds line = sdsempty();
    FILE *fp = fopen("/tmp/mympd-test/state/test", "r");
    int rc = sds_getline(&line, fp, 1000);
    fclose(fp);
    ASSERT_EQ(rc, 0);
    ASSERT_STREQ(line, "asdfjlkasdfjklsafd");

    fp = fopen("/tmp/mympd-test/state/test", "r");
    rc = sds_getline(&line, fp, 5);
    fclose(fp);
    ASSERT_EQ(rc, -2);
    sdsfree(line);
}

UTEST(sds_extras, test_sds_getline_n) {
    sds line = sdsempty();
    FILE *fp = fopen("/tmp/mympd-test/state/test", "r");
    int rc = sds_getline_n(&line, fp, 1000);
    fclose(fp);
    ASSERT_EQ(rc, 0);
    ASSERT_STREQ(line, "asdfjlkasdfjklsafd\n");

    unlink("/tmp/mympd-test/state/test");
    sdsfree(line);
}
