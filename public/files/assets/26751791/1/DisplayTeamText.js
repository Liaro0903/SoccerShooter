var DisplayTeamText = pc.createScript('displayTeamText');

// initialize code called once per entity
DisplayTeamText.prototype.initialize = function() {
    var self = this;
    this.app.on('updateTeam', function(team) {
        self.entity.element.text = 'Team ' + team;
        if (team === 'Enemy') self.entity.element.color = new pc.Color(1, 0, 0);
    });
};