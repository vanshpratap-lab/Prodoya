# Sample data for development.
puts "Seeding users..."
5.times do |i|
  User.find_or_create_by!(email: "engineer#{i + 1}@example.com") do |u|
    u.password = "password123"
    u.full_name = ["Aarav Sharma", "Meera Patel", "Kabir Singh", "Diya Nair", "Arjun Reddy"][i]
    u.username = ["aarav", "meera", "kabir", "diya", "arjun"][i]
    u.college = ["MIT", "IIT Bombay", "Stanford", "NIT Trichy", "BITS Pilani"][i]
    u.role = ["Computer Engineering", "Mechanical Engineering", "Electrical Engineering", "Chemical Engineering", "Aerospace Engineering"][i]
    u.github_url = "https://github.com/example#{i + 1}"
    u.bio = "Engineering student building things in public."
    u.points = [120, 340, 90, 210, 560][i]
  end
end

puts "Seeding channels..."
[
  { name: "#general", description: "Community-wide discussion" },
  { name: "#builds", description: "Show what you're building" },
  { name: "#help", description: "Ask for technical help" },
  { name: "#off-topic", description: "Anything else" },
].each do |ch|
  Channel.find_or_create_by!(name: ch[:name]) { |c| c.description = ch[:description] }
end

puts "Seeding posts..."
users = User.order(:id).limit(5)
sample_posts = [
  ["Just shipped my first REST API in Rails! Full CRUD with tests. #buildInPublic", "advanced"],
  ["Implemented a merge sort from scratch in C. Finally understand recursion. #algorithms", "intermediate"],
  ["Deployed my portfolio to Vercel today. Feeling accomplished! #webdev", "beginner"],
  ["Reverse engineered my college's WiFi captive portal for research. Got permission first 😉 #networking #research", "advanced"],
  ["Wrote my first React component today. Baby steps! #webdev", "beginner"],
  ["Contributed to an open-source repo for the first time. The maintainers merged my PR! #opensource", "intermediate"],
]

sample_posts.each do |(content, difficulty)|
  Post.create!(user: users.sample, content: content, difficulty: difficulty) unless Post.exists?(content: content)
end

puts "Seeding a few likes/comments/messages..."
posts = Post.limit(6)
3.times do
  posts.sample.post_likes.create!(user: users.sample, post: posts.sample)
rescue ActiveRecord::RecordInvalid
end

general = Channel.find_by(name: "#general")
Message.create!(channel: general, user: users[0], body: "Hey everyone! Welcome to Prodoya 👋")
Message.create!(channel: general, user: users[1], body: "Happy to be here. Love the proof-of-work concept.")
Message.create!(channel: general, user: users[2], body: "Where do I share my first project?")

Notification.create!(user: users[0], body: "meera connected with you")
Notification.create!(user: users[0], body: "kabir commented on your post")

puts "Done! Users: engineer1@example.com / password123"