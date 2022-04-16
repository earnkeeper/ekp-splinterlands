# Changelog

<!-- https://keepachangelog.com/en/1.0.0/ -->

## [1.2.8] - 2022-04-15

### Fixed

- 🐛 Slow performance on all pages due to battle processor hogging resources
- 🐛 Now fetching champion league battles too

## [1.2.7] - 2022-04-15

### Added

- ✨ More battle data for higher leagues

### Fixed

- 🐛 Some battles stored with incorrect league name

## [1.2.6] - 2022-04-14

### Added

- ✨ Add power ratings to the Marketplace, total power for starred cards
- ✨ New page: Card Browser, browse and filter all cards in the game in detail. With links out to splinterlands pages
- ✨ New page: Db Stats, check the latest state of our battles database, we are using it to improve how many battles we index

### Fixed

- 🐛 Incorrect power calculations for most cards
- 🐛 Width of star button in marketplace rows

## [1.2.5] - 2022-04-13

### Added

- ✨ Can now filter the Battle Planner by quest to see which teams satisfy your current quest

## [1.2.4] - 2022-04-12

### Added

- ✨ Can now add market cards to favourites, see total favourites value, filter by favourites

## [1.2.3] - 2022-04-11

### Added

- ✨ Marketplace battles and win rates can now be filtered by league
- ✨ New Battles page, view the battles that created the win stats on the planner and marketplace pages
- ✨ New market sale details popup when clicking on a listing in the marketplace
- ✨ Card attributes added to listings in the marketplace, you can sort by these now
- ✨ Now syncing battles for all entered igns as well, so that player history could be more than last 50 battles
- ✨ Link to watch battle replay from Battle History

### Fixed

- 🐛 Marketplace battle count now takes level into account
- 🐛 Zero purchase cost in Saved Teams page
- 🐛 Ruleset icons now being displayed correctly
- 🐛 Correctly show DRAW results in Battle History

## [1.2.2] - 2022-04-08

### Added

- ✨ Filters checkboxes are using splinterlands icons when available now
- ✨ Table cells are using splinterlands icons when available now
- ✨ Wins and losses in Battle History are shown in red and green now
- ✨ Slightly better tile view for Battle History on mobile 🙂
- ✨ New filters for Saved Teams page: Splinter & Mana

### Changed

- 🔨 Fetching more battle data, and fetching all rule sets, user can filter by rule set in the client

## [1.2.1] - 2022-04-07

### Added

- ✨ Battle History Page, showing your battle history, or that of any player name
- ✨ Card Collection Page, show your card collection and its market value

### Fixed

- 🐛 Marketplace filters, easier to use now
