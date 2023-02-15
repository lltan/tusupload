
$(function () {
    var upload;
    //上传
    $('#submit').click(function () {
        $('#progress-group').show();
        var file = $('#file')[0].files[0];
        // 创建tus上传对象
        upload = new tus.Upload(file, {
            // 文件服务器上传终结点地址设置
            endpoint: "uploadFile/",
            // 重试延迟设置
            retryDelays: [0, 3000, 5000, 10000, 20000],
            // 附件服务器所需的元数据
            metadata: {
                name: file.name,
                contentType: file.type || 'application/octet-stream',
                emptyMetaKey: ''
            },
            // 回调无法通过重试解决的错误
            onError: function (error) {
                console.log("Failed because: " + error)
            },
            // 上传进度回调
            onProgress: onProgress,
            // 上传完成后回调
            onSuccess: function () {
                console.log("Download %s from %s", upload.file.name, upload.url)
            }
        })
        upload.start()
    });
    //暂停
    $('#pause').click(function () {
        upload.abort()
    });
    //继续
    $('#continue').click(function () {
        upload.start()
    });
    //上传进度展示
    function onProgress(bytesUploaded, bytesTotal) {
        var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
        $('#progress').attr('aria-valuenow', percentage);
        $('#progress').css('width', percentage + '%');
        $('#percentage').html(percentage + '%');
        var uploadBytes = byteToSize(bytesUploaded);
        var totalBytes = byteToSize(bytesTotal);
        $('#size').html(uploadBytes + '/' + totalBytes);
    }
    //将字节转换为Byte、KB、MB等
    function byteToSize(bytes, separator = '', postFix = '') {
        if (bytes) {
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.min(parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10), sizes.length - 1);
            return `${(bytes / (1024 ** i)).toFixed(i ? 1 : 0)}${separator}${sizes[i]}${postFix}`;
        }
        return 'n/a';
    }
})