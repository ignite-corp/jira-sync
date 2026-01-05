### serverInfo

```bash
curl --request GET \
 --url 'https://ignitecorp.atlassian.net/rest/api/3/serverInfo' \
 --header 'User-Agent: curl' \
 --user 'ssj@ignite.co.kr:ATATT3xFfGF0_r468RdxCSXwcgLxCFzI8z6AG2CXVb83sh2R4OocNwJa8rDjGTp228R-0udwYsqTyREtSfI4hyTl-2pynOtnraogZuSUTBuqquk7lPncFWeSncPCLo7oY5FMeGIUd1QgZEjl_mGpD8yD7Jf85Zth7IqIgLnRZv32Ef5BY_UM-BA=7ED6BD60' \
 --header 'Accept: application/json'
```

---

### 특정 티켓 상세 정보 조회

```bash
# FEHG-2273 조회
curl -s --request GET \
 --url 'https://ignitecorp.atlassian.net/rest/api/3/issue/FEHG-2273' \
 --user 'ssj@ignite.co.kr:ATATT3xFfGF0_r468RdxCSXwcgLxCFzI8z6AG2CXVb83sh2R4OocNwJa8rDjGTp228R-0udwYsqTyREtSfI4hyTl-2pynOtnraogZuSUTBuqquk7lPncFWeSncPCLo7oY5FMeGIUd1QgZEjl_mGpD8yD7Jf85Zth7IqIgLnRZv32Ef5BY_UM-BA=7ED6BD60' \
 --header 'Accept: application/json' | jq '{
   key: .key,
   summary: .fields.summary,
   issuetype: {
     name: .fields.issuetype.name,
     id: .fields.issuetype.id
   },
   status: .fields.status.name,
   project: .fields.project.key
 }'
```

```bash
curl -s --request GET \
 --url 'https://hmg.atlassian.net/rest/api/3/issue/AUTOWAY-2636' \
 --header 'User-Agent: curl' \
 --user 'zs11262@hyundai-partners.com:ATATT3xFfGF0v70_ChxuVu_2AttcM-kGLOMQrkgbMtcxRFNO8zDGTP2vcSi5-j2Mfv6NNpEhD4tj8wBFyp-9aqEl2IX72YLmjVdVKmt4e9zcMneRnUnEbjv0AKSbMdsFUeo6vDDi0ycPLvSNmBaIlt0ulVl6jfXFhDBXB8X4ipHGsWqfyxpWw18=CAA1E8F6' \
 --header 'Accept: application/json'
```

---

### FEHG 프로젝트 이슈 타입 목록 조회

```bash
curl -s --request GET \
 --url 'https://ignitecorp.atlassian.net/rest/api/3/project/FEHG' \
 --user 'ssj@ignite.co.kr:ATATT3xFfGF0_r468RdxCSXwcgLxCFzI8z6AG2CXVb83sh2R4OocNwJa8rDjGTp228R-0udwYsqTyREtSfI4hyTl-2pynOtnraogZuSUTBuqquk7lPncFWeSncPCLo7oY5FMeGIUd1QgZEjl_mGpD8yD7Jf85Zth7IqIgLnRZv32Ef5BY_UM-BA=7ED6BD60' \
 --header 'Accept: application/json' | jq '.issueTypes[] | {
   name: .name,
   id: .id,
   description: .description
 }'
```

---

### AUTOWAY 프로젝트 이슈 타입 조회 (HMG Jira)

```bash
curl -s --request GET \
 --url 'https://hmg.atlassian.net/rest/api/3/project/AUTOWAY' \
 --header 'User-Agent: curl' \
 --user 'zs11262@hyundai-partners.com:ATATT3xFfGF0v70_ChxuVu_2AttcM-kGLOMQrkgbMtcxRFNO8zDGTP2vcSi5-j2Mfv6NNpEhD4tj8wBFyp-9aqEl2IX72YLmjVdVKmt4e9zcMneRnUnEbjv0AKSbMdsFUeo6vDDi0ycPLvSNmBaIlt0ulVl6jfXFhDBXB8X4ipHGsWqfyxpWw18=CAA1E8F6' \
 --header 'Accept: application/json' | jq '.issueTypes[] | {
   name: .name,
   id: .id
 }'
```
