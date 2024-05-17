<template>
  <el-form label-width="120px">
    <el-form-item label="카테고리">
      <el-select v-model="postForm.category" placeholder="카테고리">
        <el-option label="자유" value="FREE"></el-option>
        <el-option label="정보" value="INFORMATION"></el-option>
        <el-option label="거래" value="TRADE"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="제목">
      <el-input v-model="postForm.title"
                placeholder="제목 입력"></el-input>
    </el-form-item>

    <el-form-item label="내용">
      <el-input type="textarea"
                v-model="postForm.content"
                :rows="15"
                placeholder="내용을 입력해주세요."
                size="large"
                show-word-limit
                maxlength="10000"></el-input>
    </el-form-item>
    <el-form-item>
      <el-upload
        action="#"
        method="get"
        v-model:file-list="fileList"
        multiple
        :on-remove="handleRemove"
        :before-remove="beforeRemove"
        :on-exceed="handleExceed"
        :on-preview="handlePictureCardPreview"
        :limit="5"
        list-type="picture-card"
        accept="image/*"
      >
        <el-button type="primary">Image Upload</el-button>
        <template #tip>
          <div class="el-upload_tip">
            jpg/png files with a size 5MB.
          </div>
        </template>
      </el-upload>

      <el-dialog v-model="dialogVisible">
        <img style="max-width: 100%; max-height: 100%;" :src="dialogImageUrl" alt="Preview Image"  />
      </el-dialog>

    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onWrite()">글 작성</el-button>
    </el-form-item>

  </el-form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
  import axios from "axios";
  import {useRoute, useRouter} from "vue-router";
import type { FieldError } from '@/custom-types/fieldError'
import { usePostsStore } from '@/stores/posts'
import axiosInstance from '@/api/axios'
import { ElMessage, ElMessageBox, type UploadProps, type UploadUserFile } from 'element-plus'

  const router=useRouter();
  const route=useRoute();
  const postsStore=usePostsStore();
  const postId=route.params.postId;

  const postForm=ref({
    title:'',
    content:'',
    category:postsStore.getCategory,
    imgUrls:[],
  })
  const fileList = ref<UploadUserFile[]>([])
  const deleteFileList= ref<UploadUserFile[]>([])
  const copyFileList=ref<UploadUserFile[]>([])
  const deleteList:string[]=[]

  const dialogVisible =ref(false)
  const dialogImageUrl = ref('')

  const body=new FormData();
  const handleExceed: UploadProps['onExceed']=(files,uploadFiles)=>{
    ElMessage.warning(
      `The limit is 5, you selected ${files.length} files this time, add up to ${
        files.length + uploadFiles.length
      } totally`
    )
  }

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}
  const handleRemove: UploadProps['onRemove'] = (file, uploadFiles) => {
    deleteFileList.value.push(file);
  }
  const beforeRemove: UploadProps['beforeRemove'] = (uploadFile, uploadFiles) => {
    return ElMessageBox.confirm(
      `이미지를 취소합니까?`
    ).then(
      () => true,
      () => false
    )
  }

if(route.name==='post-edit') {
    onMounted(() => {
      const post = postsStore.getPost;
      postForm.value.title = post.title;
      postForm.value.content = post.content;
      postForm.value.imgUrls=post.imgUrls;

      //받아온 url로 이미지 수정에서 표시 화면에 표시할 fileList , 수정할때 비교할 copyList에 각 각 저장합니다. ㅇㅈ못하나보다
      postForm.value.imgUrls.forEach((url)=>{
          const file:UploadUserFile = {
            name:url,
            url:url
          };
          fileList.value.push(file);
          copyFileList.value.push(file);
      });

      console.log(post);
    });
  }


  const onWrite= async function() {
    try {
      //@Parampart는 데이터 타입 명시 수정,작성 둘다 동일하게 작동하니 여기에 작성했습니다.
      const blob=new Blob([JSON.stringify(postForm.value)],{type:'application/json',});

      if(route.name==='post-edit'){
        body.append('editPostDto',blob)

        //fileList에서 copyFileList(원본)에 포함되지 않는 파일 즉 새로 추가한 파일들을 보냅니다.
        fileList.value.forEach((file)=>{
            if(!copyFileList.value.some(copyFile => copyFile.name===file.name&&copyFile.url===file.url)){
                body.append("files",file.raw!);
                console.log("files:"+file.name)
            }
        });

        //DeleteFileList에서 copyFileList(원본)에 포함되어있던 파일은 s3에서 삭제할 파일들입니다. 이것들을 보내줍니다.
        deleteFileList.value.forEach((file)=>{
          if(copyFileList.value.some(copyFile => copyFile.name===file.name&&copyFile.url===file.url)){
          //  body.append("deleteFiles",new Blob([JSON.stringify(postForm.value)],{type:'application/json',}));
              deleteList.push(file.url!);
          }
        });
        body.append("deleteFiles",new Blob([JSON.stringify(deleteList)],{type:'application/json',}));

        await axiosInstance.post(`/posts/${postId}`,body,{
          headers:{
            "Content-Type":'multipart/form-data',
          },
          withCredentials: true
        });
      }else {
        body.append('newPostDto',blob)
        //fileList 의 값들 담아서 보내기
        fileList.value.forEach((file) => {
          body.append("files",file.raw!);
        });
        await axiosInstance.post("/posts/new", body, {
          headers:{
            "Content-Type":'multipart/form-data',
          },
          withCredentials: true
        });
      }
      router.replace({name: "home"})
    }catch (error:any){
      if(error.response) {
        const errorData = error.response.data;
        alert(`게시글 작성 실패: ${errorData.message}`);
        if (errorData.errors.length > 0) {
          errorData.errors.forEach((fieldError: FieldError) => {
            alert(`${fieldError.field}: ${fieldError.reason}`)
          });
        }
      }
    }
  }

</script>


<style scoped>

</style>