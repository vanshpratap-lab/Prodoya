# Serializes records into the exact JSON shapes the React frontend consumes.
module ApiSerializer
  module_function

  def profile(user)
    return nil unless user
    {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      college: user.college || "",
      role: user.role || "Engineering Student",
      avatar_url: user.avatar_url || "",
      cover_url: user.cover_url,
      bio: user.bio || "",
      github_url: user.github_url || "",
      linkedin_url: user.linkedin_url,
      twitter_url: user.twitter_url,
      tech_stack: user.tech_stack || [],
      points: user.points || 0,
      last_post_at: user.last_post_at&.iso8601,
      created_at: user.created_at.iso8601,
    }
  end

  def post(post, viewer: nil, like_count: nil, comment_count: nil, repost_count: nil)
    author = post.user
    lc = like_count
    lc = post.post_likes.count if lc.nil? && !post.association(:post_likes).loaded?
    rc = repost_count
    rc = post.post_reposts.count if rc.nil? && !post.association(:post_reposts).loaded?
    cc = comment_count
    cc = post.post_comments.count if cc.nil? && !post.association(:post_comments).loaded?
    {
      id: post.id,
      author_id: post.user_id,
      content: post.content,
      tags: post.tags || [],
      ai_difficulty: post.difficulty,
      ai_points: post.points || 0,
      code_snippet: post.code_snippet,
      github_url: post.github_url,
      image_urls: post.image_urls || [],
      video_url: post.video_url,
      created_at: post.created_at.iso8601,
      author: profile(author),
      like_count: lc.to_i,
      has_liked: viewer ? post.liked_by?(viewer) : false,
      repost_count: rc.to_i,
      has_reposted: viewer ? post.reposted_by?(viewer) : false,
      comment_count: cc.to_i,
      has_saved: viewer ? post.saved_by?(viewer) : false,
    }
  end

  def comment(comment)
    {
      id: comment.id,
      post_id: comment.post_id,
      author_id: comment.user_id,
      text: comment.body,
      created_at: comment.created_at.iso8601,
      author: profile(comment.user),
    }
  end

  def channel(channel)
    {
      id: channel.id,
      name: channel.name,
      emoji: channel.emoji || "💬",
      description: channel.description || "",
      participant_1: channel.participant_1,
      participant_2: channel.participant_2,
    }
  end

  def message(message)
    {
      id: message.id,
      chat_id: message.channel_id,
      sender_id: message.user_id,
      text: message.body,
      created_at: message.created_at.iso8601,
      sender: profile(message.user),
    }
  end

  def notification(notification)
    actor = notification.actor
    {
      id: notification.id,
      icon: notification.icon || "🔔",
      text: notification.body,
      time_formatted: time_ago(notification.created_at),
      created_at: notification.created_at.iso8601,
      category: notification.category || "system",
      read_at: notification.read_at&.iso8601,
      actor: actor ? { full_name: actor.full_name, avatar_url: actor.avatar_url || "" } : nil,
    }
  end

  def activity(user)
    posts = user.posts
    comments_by_user = PostComment.where(user_id: user.id)
    {
      active_days: active_days(user),
      projects_built: posts.count,
      learning_sessions: sessions_count(user),
      open_source_contributions: posts.where.not(github_url: nil).count + PostRepost.where(user_id: user.id).count,
      research_activity: comments_by_user.count,
      community_contributions: likes_given(user),
      reputation_score: user.points.to_i,
      ai_impact_score: ai_impact(user),
    }
  end

  def calendar(user, days: 371)
    cutoff = days.days.ago.beginning_of_day
    rows = user.posts
      .where("created_at >= ?", cutoff)
      .group("date(created_at)")
      .count
    rows.map { |day, count| { activity_date: day.to_date.iso8601, post_count: count } }
  end

  def leaderboard(user, rank_score)
    {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      college: user.college || "",
      role: user.role || "Engineering Student",
      avatar_url: user.avatar_url || "",
      cover_url: user.cover_url,
      bio: user.bio || "",
      github_url: user.github_url || "",
      linkedin_url: user.linkedin_url,
      twitter_url: user.twitter_url,
      tech_stack: user.tech_stack || [],
      points: user.points || 0,
      last_post_at: user.last_post_at&.iso8601,
      created_at: user.created_at.iso8601,
      rank_score: rank_score.round(4),
      active_days: active_days(user),
      projects_built: user.posts.count,
      open_source_contributions: user.posts.where.not(github_url: nil).count + PostRepost.where(user_id: user.id).count,
      community_contributions: likes_given(user),
      ai_impact_score: ai_impact(user),
    }
  end

  def active_days(user)
    user.posts.where("created_at >= ?", 371.days.ago).distinct.count("date(created_at)")
  end

  def sessions_count(user)
    user.post_comments.joins(:post).where("post_comments.created_at >= ?", 371.days.ago).count
  end

  def likes_given(user)
    PostLike.where(user_id: user.id, created_at: 371.days.ago..).count +
      PostRepost.where(user_id: user.id, created_at: 371.days.ago..).count
  end

  def ai_impact(user)
    (sessions_count(user) * 0.5 + PostComment.where(user_id: user.id, created_at: 371.days.ago..).count * 0.8).round(1)
  end

  def time_ago(time)
    return nil unless time
    seconds = (Time.current - time).to_i
    case seconds
    when 0..59 then "just now"
    when 60..3599 then "#{(seconds / 60).to_i}m ago"
    when 3600..86_399 then "#{(seconds / 3600).to_i}h ago"
    when 86_400..604_799 then "#{(seconds / 86_400).to_i}d ago"
    else time.strftime("%b %d")
    end
  end
end