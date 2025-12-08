// Ignite Jira 이슈 업데이트 API

import { NextRequest, NextResponse } from 'next/server';
import { jira } from '@/lib/services/jira';

/**
 * PUT: Ignite Jira 이슈 필드 업데이트
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { issueKey: string } }
) {
  try {
    const { issueKey } = params;
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

    // Ignite Jira 이슈 필드 업데이트
    const result = await jira.ignite.updateIssueFields(issueKey, body.fields);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${issueKey} 업데이트 완료`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
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

