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

  const router=useRouter();
  const route=useRoute();
  const postsStore=usePostsStore();
  const postId=route.params.postId;

  const postForm=ref({
    title:'',
    content:'',
    category:postsStore.getCategory,
  })

  if(route.name==='post-edit') {
    onMounted(() => {
      const post = postsStore.getPost;
      postForm.value.title = post.title;
      postForm.value.content = post.content;
      console.log(post);
    });
  }


  const onWrite= async function() {
    try {
      if(route.name==='post-edit'){
        console.log(postId);
        await axios.patch(`/api/posts/${postId}`,postForm.value,{
          withCredentials: true
        });
      }else {
        await axios.post("/api/posts/new", postForm.value, {
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