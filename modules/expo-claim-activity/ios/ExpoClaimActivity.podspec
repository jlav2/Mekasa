Pod::Spec.new do |s|
  s.name           = 'ExpoClaimActivity'
  s.version        = '1.0.0'
  s.summary        = 'MeKasa spot-claim Live Activity control (ActivityKit).'
  s.description    = 'Start/update/end the שריון מקום Live Activity from JS.'
  s.author         = ''
  s.homepage       = 'https://mekasa.app'
  s.platforms      = { :ios => '16.2' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
