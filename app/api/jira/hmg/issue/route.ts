// HMG Jira 이슈 생성 API

import { NextRequest, NextResponse } from 'next/server';
import { jira } from '@/lib/services/jira';

/**
 * POST: HMG Jira에 이슈 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 유효성 검증
    if (!body.fields) {
      return NextResponse.json(
        {
          success: false,
          error: 'fields는 필수입니다.',
        },
        { status: 400 }
      );
    }

    // HMG Jira 이슈 생성
    const result = await jira.hmg.createIssue(body);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: (result as any).details,
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

