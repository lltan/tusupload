using System.Text;
using tusdotnet;
using tusdotnet.Interfaces;
using tusdotnet.Models;
using tusdotnet.Models.Configuration;
using tusdotnet.Models.Expiration;
using tusdotnet.Stores;

namespace tusupload.TusMiddleware
{
    public class TusMiddleware
    {
        public static DefaultTusConfiguration CreateTusConfiguration(WebApplicationBuilder builder)
        {
            string env = builder.Environment.WebRootPath;
            string tusFiles = Path.Combine(env, "tusFiles");
            if(!Directory.Exists(tusFiles)){
                Directory.CreateDirectory(tusFiles);
            }

            return new DefaultTusConfiguration(){
                UrlPath ="/uploadFile",
                //文件存储路径
                Store = new TusDiskStore(tusFiles),
                //元数据是否允许空值
                MetadataParsingStrategy =  MetadataParsingStrategy.AllowEmptyValues,
                //文件过期后更新
                Expiration = new AbsoluteExpiration(TimeSpan.FromMinutes(5)),
                //事件处理
                Events = new Events()
                {
                    //文件上传完成事件回调
                    OnFileCompleteAsync=async ctx=>{
                        //获取上传文件
                        var file = await ctx.GetFileAsync();
                        //获取上传文件元数据
                        var metadatas =await file.GetMetadataAsync(ctx.CancellationToken);
                        //获取上述文件元数据的目标文件名称
                        var fileNameMetadata = metadatas["name"];
                        //目标文件已base64编码，所以这里需要解码
                        var fileName = fileNameMetadata.GetString(Encoding.UTF8);
                        var extensionName = Path.GetExtension(fileName);
                        //将上传文件转换为实际目标文件
                        File.Move(Path.Combine(tusFiles,ctx.FileId),Path.Combine(tusFiles,$"{ctx.FileId}{extensionName}"));
                        var teminationStore = ctx.Store as ITusTerminationStore;
                        await teminationStore!.DeleteFileAsync(file.Id,ctx.CancellationToken);
                    }
                }
            };

        }
    }
}
