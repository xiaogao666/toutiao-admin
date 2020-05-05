<template>
  <div class="article-container">
      <el-card class="filter-card">
  <div slot="header" class="clearfix">
          <!-- 面包屑路径导航 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
      <el-breadcrumb-item>内容首页</el-breadcrumb-item>
  </el-breadcrumb>
         <!-- 面包屑路径导航结束 -->
  </div>
         <!-- 数据赛选表单 -->
  <el-form size="small" ref="form" :model="form" label-width="60px">

      <el-form-item label="状态">
    <el-radio-group v-model="status">
      <el-radio :label="null">全部</el-radio>
      <el-radio :label="0">草稿</el-radio>
      <el-radio :label="1">待审核</el-radio>
      <el-radio :label="2">审核通过</el-radio>
      <el-radio :label="3">审核失败</el-radio>
      <el-radio :label="4">已删除</el-radio>
    </el-radio-group>
  </el-form-item>

    <el-form-item label="频道">
    <el-select v-model="channelId" placeholder="请选择频道">
      <el-option
        label="全部"
        :value="null"
        ></el-option>
      <el-option
       :label="channel.name"
        :value="channel.id"
        v-for="(channel,index) in channels"
        :key="index"
        ></el-option>
    </el-select>
  </el-form-item>
  <el-form-item label="日期">
    <el-date-picker
      v-model="rangeDate"
      type="datetimerange"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      :default-time="['12:00:00']"
      value-format="yyyy-MM-dd"
      >
    </el-date-picker>
   </el-form-item>
   <el-form-item>
     <el-button :disabled="loading" type="primary" @click="loadArticles(1)">查询</el-button>
   </el-form-item>
   </el-form>
    <!-- 数据赛选表单 -->
</el-card>

    <el-card class="box-card">
        <div slot="header" class="clearfix">
            根据筛选条件共查询到 {{totalCount}} 条结果：
        </div>
  <!-- 数据列表 -->
    <el-table
      :data="articles"
      stripe
      size="small"
      style="width: 100%"
      class="list-table"
      v-loading="loading"
      >
      <el-table-column
        prop="date"
        label="封面"
      >
      <template slot-scope="scope">
        <el-image
      style="width: 100px; height: 100px"
      :src="scope.row.cover.images[0]"
      fit="cover"
      lazy>
      <div slot="placeholder" class="image-slot">
        加载中<span class="dot">...</span>
      </div></el-image>
        <!-- <img
        v-if="scope.row.cover.images[0]"
        :src="scope.row.cover.images[0]"
        alt=""
        class="article-cover"
        >
        <img v-else src="./no-cover.gif" class="article-cover" alt=""> -->
      </template>
      </el-table-column>
      <el-table-column
        prop="title"
        label="标题"
      >
      </el-table-column>
      <el-table-column
        label="状态">
        <!-- 如果需要在自定义模板中获取当期遍历项数据，那么就在 template 上声明 slot-scope="scope" -->
        <template slot-scope="scope">
          <el-tag :type="articleStatus[scope.row.status].type">{{ articleStatus[scope.row.status].text }}
          </el-tag>
          <!-- <el-tag v-if="scope.row.status === 0" type="warning">草稿</el-tag>
          <el-tag v-if="scope.row.status === 1">待审核</el-tag>
          <el-tag v-if="scope.row.status === 2" type="success">审核通过</el-tag>
          <el-tag v-if="scope.row.status === 3" type="danger">审核失败</el-tag>
          <el-tag v-if="scope.row.status === 4" type="info">已删除</el-tag> -->
        </template>
      </el-table-column>
      <el-table-column
        prop="pubdate"
        label="发布时间">
      </el-table-column>
      <el-table-column
        label="操作">
         <template slot-scope="scope">
        <el-button
          size="mini"
          circle
          icon="el-icon-edit"
          type="primary"
          @click="$router.push('/publish?id=' + scope.row.id.toString())"
         ></el-button>
        <el-button
          size="mini"
          type="danger"
          circle
          icon="el-icon-delete"
          @click="onDeletArticle(scope.row.id)"
        ></el-button>
      </template>
      </el-table-column>
    </el-table>
    <!-- 数据列表 -->
    <!-- 列表分页 -->
    <el-pagination
    layout="prev, pager, next"
    background
    :total="totalCount"
    :current-page.sync="page"
    :page-size="pageSize"
    :disabled="loading"
    @current-change="onCurrentChange"
    >
    </el-pagination>
  <!-- 列表分页 -->
</el-card>

  </div>
</template>

<script>
import { getArticles, getArticleChannels, deleteArticle } from '@/api/article'
export default {
  name: 'ArticleIndex',
  data () {
    return {
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      articles: [], // 文章数据列表
      articleStatus: [
        { status: 0, text: '草稿', type: 'info' }, // 0
        { status: 1, text: '待审核', type: '' }, // 1
        { status: 2, text: '审核通过', type: 'success' }, // 2
        { status: 3, text: '审核失败', type: 'warning' }, // 3
        { status: 4, text: '已删除', type: 'danger' } // 4
      ],
      totalCount: 0, // 总数据条数
      pageSize: 10, // 每页大小
      status: null, // 查询文章的状态，不传就是全部
      channels: [], // 文章频道列表
      channelId: null, // 查询文章的频道
      rangeDate: null, // 筛选的范围日期
      loading: true, // 表格数据加载中 loading
      page: 1 // 当前页码
    }
  },
  created () {
    this.loadArticles(1)
    this.loadChannels()
  },
  methods: {
    onSubmit () {
      console.log('submit!')
    },

    loadArticles (page = 1) {
      // 展示加载中 loading
      this.loading = true
      getArticles({
        page,
        per_page: this.pageSize,
        status: this.status,
        channel_id: this.channelId,
        begin_pubdate: this.rangeDate ? this.rangeDate[0] : null, // 开始日期
        end_pubdate: this.rangeDate ? this.rangeDate[1] : null // 截止日期
      }).then(res => {
        // console.log(res)
        const { results, total_count: totalCout } = res.data.data
        this.articles = results
        this.totalCount = totalCout

        // 关闭加载中loading
        this.loading = false
      })
    },

    onCurrentChange (page) {
      // console.log(page)
      this.loadArticles(page)
    },

    loadChannels () {
      getArticleChannels().then(res => {
        // console.log(res)
        this.channels = res.data.data.channels
      })
    },

    onDeletArticle (articleId) {
      // 找接口 请求方法 删除请求调用 处理结果,
      this.$confirm('确认删除吗?', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteArticle(articleId.toString()).then(res => {
          this.loadArticles(this.page)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style>
.filter-card {
    margin-bottom: 30px;
}
.list-table {
    margin-bottom: 20px;
}
.article-cover {
  width: 100px;
  background-size: cover;
}
</style>
