/**
 * 배포 태그 적용 서비스
 * 티켓에 배포 관련 labels를 추가
 */

import axios from 'axios';
import https from 'https';
import { JIRA_ENDPOINTS } from '@/lib/constants/jira';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export interface ApplyDeploymentTagsRequest {
  /** 티켓 키 목록 (예: ['AUTOWAY-2636']) */
  ticketKeys: string[];
  /** 추가할 레이블 목록 (예: ['QA필요', 'adhoc_251232', 'FE']) */
  labels: string[];
}

export interface ApplyDeploymentTagsResponse {
  success: boolean;
  /** 성공한 티켓 목록 */
  successTickets?: string[];
  /** 실패한 티켓 목록 */
  failedTickets?: Array<{
    ticketKey: string;
    error: string;
  }>;
  /** 에러 메시지 */
  error?: string;
}

/**
 * 티켓에 labels 추가
 * 기존 labels를 유지하면서 새 labels를 추가합니다.
 */
export async function applyDeploymentTags(
  request: ApplyDeploymentTagsRequest
): Promise<ApplyDeploymentTagsResponse> {
  const email = process.env.HMG_JIRA_EMAIL;
  const apiToken = process.env.HMG_JIRA_API_TOKEN;

  if (!email || !apiToken) {
    return {
      success: false,
      error: 'HMG Jira 인증 정보가 설정되지 않았습니다.',
    };
  }

  try {
    const { ticketKeys, labels } = request;

    const successTickets: string[] = [];
    const failedTickets: Array<{ ticketKey: string; error: string }> = [];

    // 각 티켓에 대해 순차 처리
    for (const ticketKey of ticketKeys) {
      try {
        // 1. 티켓 정보 조회 (기존 labels 확인)
        const getResponse = await axios.get(
          `${JIRA_ENDPOINTS.HMG}/rest/api/3/issue/${ticketKey}`,
          {
            params: {
              fields: 'labels',
            },
            auth: {
              username: email,
              password: apiToken,
            },
            headers: {
              Accept: 'application/json',
            },
            httpsAgent,
          }
        );

        const existingLabels = (getResponse.data.fields.labels ||
          []) as string[];

        // 2. 새 labels 병합 (중복 제거)
        // 빈 배열이 전달되면 라벨을 모두 제거
        const newLabels =
          labels.length === 0
            ? []
            : Array.from(new Set([...existingLabels, ...labels]));

        // 3. 티켓 업데이트
        await axios.put(
          `${JIRA_ENDPOINTS.HMG}/rest/api/3/issue/${ticketKey}`,
          {
            fields: {
              labels: newLabels,
            },
          },
          {
            auth: {
              username: email,
              password: apiToken,
            },
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            httpsAgent,
          }
        );

        successTickets.push(ticketKey);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          failedTickets.push({
            ticketKey,
            error:
              error.response?.data?.errorMessages?.[0] ||
              error.response?.data?.message ||
              error.message,
          });
        } else {
          failedTickets.push({
            ticketKey,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    // 결과 반환
    if (failedTickets.length === 0) {
      return {
        success: true,
        successTickets,
      };
    } else if (successTickets.length > 0) {
      // 일부 성공, 일부 실패
      return {
        success: true,
        successTickets,
        failedTickets,
      };
    } else {
      // 모두 실패
      return {
        success: false,
        error: '모든 티켓에 태그 적용이 실패했습니다.',
        failedTickets,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
