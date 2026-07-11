import ExpoModulesCore
import ActivityKit
import Foundation

// IMPORTANT: this struct MUST stay byte-identical to the copy in
// targets/claim-activity/index.swift. ActivityKit matches a running Activity to
// its widget by the ActivityAttributes type's name + Codable shape; if they
// diverge, the activity starts but renders no UI. (See docs/LIVE_ACTIVITY.md.)
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

public class ExpoClaimActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoClaimActivity")

    Function("isSupported") { () -> Bool in
      if #available(iOS 16.2, *) {
        return ActivityAuthorizationInfo().areActivitiesEnabled
      }
      return false
    }

    // Start the claim Live Activity locally. Returns the activity id, or nil if
    // Live Activities are unsupported/disabled. `info.expiresAt` is ms epoch.
    AsyncFunction("start") { (info: [String: Any]) -> String? in
      guard #available(iOS 16.2, *), ActivityAuthorizationInfo().areActivitiesEnabled else {
        return nil
      }
      let attributes = ClaimActivityAttributes(
        circleName: info["circleName"] as? String ?? "",
        beachName: info["beachName"] as? String ?? "",
        gameTime: info["gameTime"] as? String ?? "",
        deepLink: info["deepLink"] as? String ?? "mekasa://",
        avatars: info["avatars"] as? [String] ?? []
      )
      let expiresAt = Self.dateFrom(info["expiresAt"])
      let state = ClaimActivityAttributes.ContentState(
        expiresAt: expiresAt,
        waitingBehind: info["waitingBehind"] as? Int ?? 0
      )
      let activity = try Activity.request(
        attributes: attributes,
        content: .init(state: state, staleDate: expiresAt),
        pushType: nil
      )
      return activity.id
    }

    // Update an existing activity's dynamic state (expiry / waiting count).
    AsyncFunction("update") { (id: String, info: [String: Any]) in
      guard #available(iOS 16.2, *) else { return }
      let expiresAt = Self.dateFrom(info["expiresAt"])
      let state = ClaimActivityAttributes.ContentState(
        expiresAt: expiresAt,
        waitingBehind: info["waitingBehind"] as? Int ?? 0
      )
      for activity in Activity<ClaimActivityAttributes>.activities where activity.id == id {
        await activity.update(.init(state: state, staleDate: expiresAt))
      }
    }

    // End an activity (or all of them when id is empty) immediately.
    AsyncFunction("end") { (id: String) in
      guard #available(iOS 16.2, *) else { return }
      for activity in Activity<ClaimActivityAttributes>.activities where id.isEmpty || activity.id == id {
        await activity.end(nil, dismissalPolicy: .immediate)
      }
    }
  }

  private static func dateFrom(_ value: Any?) -> Date {
    let ms = (value as? Double) ?? Double(value as? Int ?? 0)
    return Date(timeIntervalSince1970: ms / 1000.0)
  }
}
