/**
 * 배포 태그 적용 API
 * POST /api/deployment/apply-tags
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  applyDeploymentTags,
  type ApplyDeploymentTagsRequest,
} from '@/lib/services/deployment/ticket-tagging.service';

export async function POST(request: NextRequest) {
  try {
    const body: ApplyDeploymentTagsRequest = await request.json();

    // 유효성 검증
    if (!body.ticketKeys || body.ticketKeys.length === 0) {
      return NextResponse.json(
        { success: false, error: '티켓을 선택해주세요.' },
        { status: 400 }
      );
    }

    // labels가 undefined인 경우만 에러 (빈 배열은 허용 - 라벨 제거용)
    if (body.labels === undefined) {
      return NextResponse.json(
        { success: false, error: 'labels 필드가 필요합니다.' },
        { status: 400 }
      );
    }

    // 배포 태그 적용
    const result = await applyDeploymentTags(body);

    if (result.success) {
      return NextResponse.json({
        success: true,
        successTickets: result.successTickets,
        failedTickets: result.failedTickets,
        message: `${result.successTickets?.length || 0}개 티켓에 태그가 적용되었습니다.`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          failedTickets: result.failedTickets,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
