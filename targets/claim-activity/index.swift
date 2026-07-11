// MeKasa — "שריון מקום" spot-claim Live Activity (design §10c).
// Widget extension built by @bacons/apple-targets. iOS 16.2+ (ActivityKit).
//
// IMPORTANT: `ClaimActivityAttributes` below MUST stay byte-identical to the
// copy in modules/expo-claim-activity/ios/ExpoClaimActivityModule.swift —
// ActivityKit matches a running Activity to this widget by the attributes
// type's name + Codable shape. If they diverge the activity starts but renders
// no UI. (See docs/LIVE_ACTIVITY.md.)

import ActivityKit
import WidgetKit
import SwiftUI

// MARK: - Attributes (keep in sync with the control module)
struct ClaimActivityAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var expiresAt: Date
    var waitingBehind: Int
  }
  var circleName: String
  var beachName: String
  var gameTime: String
  var deepLink: String
  var avatars: [String]
}

// MARK: - Palette (exact §10c)
private extension Color {
  init(hex: String) {
    let scanner = Scanner(string: hex.replacingOccurrences(of: "#", with: ""))
    var value: UInt64 = 0
    scanner.scanHexInt64(&value)
    self.init(
      .sRGB,
      red: Double((value >> 16) & 0xff) / 255,
      green: Double((value >> 8) & 0xff) / 255,
      blue: Double(value & 0xff) / 255,
      opacity: 1
    )
  }
}
private let kOrange = Color(hex: "#FF9D52") // countdown
private let kButton = Color(hex: "#FF6B2C") // claim button
private let kTeal = Color(hex: "#14B8A8") // brand ring

// A ClosedRange guaranteed valid even if expiry is already in the past.
private func timerRange(to end: Date) -> ClosedRange<Date> {
  let now = Date()
  return (now <= end ? now : end)...end
}
// The 5-minute claim window, for the progress bar.
private func windowRange(to end: Date) -> ClosedRange<Date> {
  return end.addingTimeInterval(-300)...end
}

// MARK: - Brand dashed-ring glyph
private struct BrandRing: View {
  var size: CGFloat
  var color: Color
  var body: some View {
    Circle()
      .strokeBorder(
        color,
        style: StrokeStyle(
          lineWidth: size * 0.12,
          lineCap: .round,
          dash: [size * 0.42, size * 0.13, size * 0.3, size * 0.16]
        )
      )
      .frame(width: size, height: size)
      .rotationEffect(.degrees(-25))
  }
}

private struct AvatarStack: View {
  var initials: [String]
  var body: some View {
    HStack(spacing: -8) {
      ForEach(Array(initials.prefix(3).enumerated()), id: \.offset) { _, initial in
        Text(initial)
          .font(.system(size: 11, weight: .bold))
          .foregroundColor(.white)
          .frame(width: 24, height: 24)
          .background(kTeal)
          .clipShape(Circle())
          .overlay(Circle().stroke(Color.black, lineWidth: 1.5))
      }
    }
  }
}

// MARK: - Lock-screen / banner presentation (radius 22, dark card)
private struct LockScreenView: View {
  let context: ActivityViewContext<ClaimActivityAttributes>
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack {
        BrandRing(size: 22, color: kTeal)
        Text("מקאסה · שריון מקום")
          .font(.system(size: 13, weight: .bold))
          .foregroundColor(.white)
        Spacer()
        Text("\(context.attributes.beachName) \(context.attributes.gameTime)")
          .font(.system(size: 11.5))
          .foregroundColor(.white.opacity(0.6))
      }
      HStack(alignment: .firstTextBaseline) {
        Text(timerInterval: timerRange(to: context.state.expiresAt), countsDown: true)
          .font(.system(size: 34, weight: .heavy))
          .monospacedDigit()
          .foregroundColor(kOrange)
        Spacer()
        AvatarStack(initials: context.attributes.avatars)
      }
      ProgressView(timerInterval: windowRange(to: context.state.expiresAt), countsDown: true) {
        EmptyView()
      } currentValueLabel: {
        EmptyView()
      }
      .tint(kOrange)
      Text("אם לא תתפוס — המקום עובר לבא בתור")
        .font(.system(size: 11))
        .foregroundColor(.white.opacity(0.6))
    }
    .padding(14)
    .background(Color(.sRGB, red: 16 / 255, green: 28 / 255, blue: 33 / 255, opacity: 0.9))
    .overlay(RoundedRectangle(cornerRadius: 22).stroke(Color.white.opacity(0.09), lineWidth: 1))
    .clipShape(RoundedRectangle(cornerRadius: 22))
    .environment(\.layoutDirection, .rightToLeft)
  }
}

// MARK: - Widget
struct ClaimActivityWidget: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: ClaimActivityAttributes.self) { context in
      LockScreenView(context: context)
        .widgetURL(URL(string: context.attributes.deepLink))
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          HStack(spacing: 8) {
            BrandRing(size: 26, color: kTeal)
            Text("שריון מקום")
              .font(.system(size: 13, weight: .bold))
              .foregroundColor(.white)
          }
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text("\(context.attributes.circleName) · \(context.attributes.beachName)")
            .font(.system(size: 11.5))
            .foregroundColor(.white.opacity(0.6))
            .lineLimit(1)
        }
        DynamicIslandExpandedRegion(.center) {
          Text(timerInterval: timerRange(to: context.state.expiresAt), countsDown: true)
            .font(.system(size: 44, weight: .heavy))
            .monospacedDigit()
            .tracking(-1)
            .foregroundColor(kOrange)
            .frame(maxWidth: .infinity)
            .multilineTextAlignment(.center)
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(spacing: 8) {
            Text("המקום שמור לך עד \(context.attributes.gameTime)")
              .font(.system(size: 12))
              .foregroundColor(.white.opacity(0.75))
            ProgressView(timerInterval: windowRange(to: context.state.expiresAt), countsDown: true) {
              EmptyView()
            } currentValueLabel: {
              EmptyView()
            }
            .tint(kOrange)
            Link(destination: URL(string: context.attributes.deepLink) ?? URL(string: "mekasa://")!) {
              Text("תפוס את המקום")
                .font(.system(size: 14.5, weight: .bold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, minHeight: 42)
                .background(kButton)
                .clipShape(RoundedRectangle(cornerRadius: 21))
            }
          }
        }
      } compactLeading: {
        BrandRing(size: 18, color: kTeal)
      } compactTrailing: {
        Text(timerInterval: timerRange(to: context.state.expiresAt), countsDown: true)
          .font(.system(size: 13, weight: .bold))
          .monospacedDigit()
          .foregroundColor(kOrange)
          .frame(width: 44)
      } minimal: {
        BrandRing(size: 16, color: kTeal)
      }
      .widgetURL(URL(string: context.attributes.deepLink))
      .keylineTint(kOrange)
    }
  }
}

@main
struct MeKasaWidgetBundle: WidgetBundle {
  var body: some Widget {
    ClaimActivityWidget()
  }
}
