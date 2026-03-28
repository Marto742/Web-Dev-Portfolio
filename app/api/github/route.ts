import { NextResponse } from 'next/server'

export interface ContributionDay {
  contributionCount: number
  date: string
}

export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export interface ContributionCalendar {
  totalContributions: number
  weeks: ContributionWeek[]
}

export interface GitHubData {
  calendar: ContributionCalendar
  repos: number
  followers: number
}

const QUERY = `
  query($username: String!) {
    user(login: $username) {
      repositories(privacy: PUBLIC, ownerAffiliations: [OWNER]) {
        totalCount
      }
      followers {
        totalCount
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`

export async function GET() {
  const token = process.env.GITHUB_TOKEN
  const username = process.env.GITHUB_USERNAME

  if (!token || !username) {
    return NextResponse.json(
      { error: 'GitHub credentials not configured' },
      { status: 503 }
    )
  }

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: QUERY, variables: { username } }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'GitHub API request failed' },
        { status: res.status }
      )
    }

    const json = (await res.json()) as {
      data?: {
        user?: {
          repositories?: { totalCount: number }
          followers?: { totalCount: number }
          contributionsCollection?: { contributionCalendar?: ContributionCalendar }
        }
      }
      errors?: Array<{ message: string }>
    }

    if (json.errors?.length) {
      return NextResponse.json({ error: json.errors[0].message }, { status: 400 })
    }

    const user = json.data?.user
    const calendar = user?.contributionsCollection?.contributionCalendar

    if (!calendar || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data: GitHubData = {
      calendar,
      repos: user.repositories?.totalCount ?? 0,
      followers: user.followers?.totalCount ?? 0,
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 })
  }
}
