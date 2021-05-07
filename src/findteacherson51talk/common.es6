 //*://www.51talk.com/ReserveNew/index*
    //https://www.51talk.com/TeacherNew/info/t26501111
    //https://www.51talk.com/TeacherNew/teacherComment?tid=t26501111&type=all&has_msg=1
    //https://www.51talk.com/TeacherNew/teacherComment?tid=t26501111&type=good&has_msg=1
    //https://www.51talk.com/TeacherNew/teacherComment?tid=t26501111&type=bad&has_msg=1
    //https://www.51talk.com/user/study_center_zx
    //https://www.51talk.com/user/study_center_zy
    //https://www.51talk.com/user/study_center_xx
    let url = window.location.href.toLocaleLowerCase();
    let settings = {
        url: url,
        tid: url.match(/(t\d+)/g),
        pagecount: conf.pagecount,
        isDetailPage: url.includes("teachernew"),
        isListPage: url.includes("reservenew"),
        isCoursePage: url.includes("study_center"),
    };

    function gettid() {
        return settings.tid;
    }