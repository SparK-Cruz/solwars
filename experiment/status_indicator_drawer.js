var SSI = (function() {
  var settings = {
    margin: 10,
    gaugesHeight: 150,
    height: 200,
    width: 200
  };

  var _ = {};

  var constructor = function(options) {
    _.player = options.player;
    _.ctx = options.context;
    settings.height = options.height;
    settings.width = options.width;
    settings.baseColor = options.baseColor;
  };
  var public = constructor.prototype;

  public.draw = function(status) {
    var baseColor = settings.baseColor;

    _.ctx.clearRect(0, 0, settings.width, settings.height);
    _.drawHealthShieldGauge(_.player.health, _.player.shieldCapacity, status.damage, status.shield);
    _.drawPowerGauge(_.player.engineCapacity, status.engine, _.darkenColor(baseColor, 33), 20);
    _.drawPowerGauge(_.player.weaponCapacity, status.weapon, _.darkenColor(baseColor, 33), 40);
    _.drawEnergyItem(_.player.energyTankCapacity, status.energyTank, _.lightenColor(baseColor, 33), 60);
  };
  _.drawHealthShieldGauge = function(health, cap, damage, shield) {
    var pos = _.drawGaugeBackground(0);
    var drawStart = pos[0];
    var drawEnd = pos[1];

    var padding = 2;

    drawStart[0] += padding;
    drawStart[1] += padding;
    drawEnd[0] -= padding * 2;

    var ghealth = (settings.gaugesHeight - padding * 2) / (health + cap) * health;
    var gcap = (settings.gaugesHeight - padding * 2) / (health + cap) * cap;
    var gdamage = ghealth / 100 * damage;
    var gshield = gcap / 100 * shield;

    drawStart[1] += gdamage + (gcap - gshield);
    drawEnd[1] = gshield;

    var color = _.mixColors(settings.baseColor, '#FF0000', damage / 100 * 120);
    var darkColor = _.darkenColor(color, 33);

    _.drawGauge(drawStart, drawEnd, _.rgbString(color), null);

    drawStart[1] += drawEnd[1];
    drawEnd[1] = ghealth - gdamage;

    _.drawGauge(drawStart, drawEnd, _.rgbString(darkColor), null);
  };

  _.rgbString = function(color) {
    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
  };
  _.rgbHex = function(color) {
    var index = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F'];

    var hex = [
      index[Math.round(color.r / 16)] + index[color.r % 16],
      index[Math.round(color.g / 16)] + index[color.g % 16],
      index[Math.round(color.b / 16)] + index[color.b % 16]
    ];

    return '#'+hex.join('');
  };

  _.mixColors = function(colorA, colorB, degree){
    if (typeof colorA == 'string')
      colorA = _.hexToRGB(colorA);

    if (typeof colorB == 'string')
      colorB = _.hexToRGB(colorB);

    if (degree > 100)
      degree = 100;

    if (degree < 0)
      degree = 0;

    var mix = {};

    mix.r = (colorB.r - colorA.r) * (degree / 100) + colorA.r;
    mix.g = (colorB.g - colorA.g) * (degree / 100) + colorA.g;
    mix.b = (colorB.b - colorA.b) * (degree / 100) + colorA.b;

    return mix;
  };

  _.darkenColor = function(color, degree) {
    return _.mixColors(color, '#000000', degree);
  };
  _.lightenColor = function(color, degree) {
    return _.mixColors(color, '#FFFFFF', degree);
  };

  _.hexToRGB = function(hexString) {
    var color = {};
    hexString = hexString.substr(1);

    color.r = parseInt('0x' + hexString.substr(0,2));
    color.g = parseInt('0x' + hexString.substr(2,2));
    color.b = parseInt('0x' + hexString.substr(4,2));

    return color;
  };

  _.drawPowerGauge = function(cap, power, color, offset) {
    var pos = _.drawGaugeBackground(offset);
    var drawStart = pos[0];
    var drawEnd = pos[1];
    var padding = 2;

    drawStart[0] += padding;
    drawStart[1] += padding;
    drawEnd[0] -= padding * 2;

    var gcap = settings.gaugesHeight - (padding * 2);
    var gpower = gcap / 100 * power;

    drawStart[1] += gcap - gpower;
    drawEnd[1] = gpower;

    _.drawGauge(drawStart, drawEnd, color, null);
  };

  _.drawGaugeBackground = function(offset) {
    var drawStart = [offset + settings.margin, settings.height - settings.gaugesHeight - (settings.margin * 2)];
    var drawEnd = [10, settings.gaugesHeight];

    _.drawGauge(drawStart, drawEnd, null, '#808080');

    return [drawStart, drawEnd];
  };
  _.drawGauge = function(start, end, fillStyle, strokeStyle) {
    if (fillStyle != null && typeof fillStyle != 'string')
      fillStyle = _.rgbString(fillStyle);

    if (strokeStyle != null && typeof strokeStyle != 'string')
      strokeStyle = _.rgbString(strokeStyle);

    _.ctx.save();
    _.ctx.beginPath();
    _.ctx.rect(start[0], start[1], end[0], end[1]);
    if (fillStyle != null) {
      _.ctx.fillStyle = fillStyle;
      _.ctx.fill();
    }
    if (strokeStyle != null) {
      _.ctx.lineWidth = 1;
      _.ctx.strokeStyle = strokeStyle;
      _.ctx.stroke();
    }
    _.ctx.closePath();
    _.ctx.restore();
  };

  _.drawEnergyItem = function(cap, power, color, offset) {
    if (typeof color != 'string')
      color = _.rgbString(color);

    var itemHeight = 30;
    var pos = _.drawItemFrame(itemHeight, offset);
    var center = {
      x: pos[0][0] + itemHeight / 2,
      y: pos[0][1] + itemHeight / 2
    };

    var gpower = (Math.PI * 2) * (power / 100);

    _.ctx.save();

    _.ctx.beginPath();
    _.ctx.arc(center.x, center.y, itemHeight * 0.45, 0, Math.PI * 2, false);
    _.ctx.closePath();
    _.ctx.clip();

    _.ctx.beginPath();
    _.ctx.arc(center.x, center.y, itemHeight / 2, 0, gpower, false);
    _.ctx.lineWidth = itemHeight;
    _.ctx.strokeStyle = color;
    _.ctx.stroke();
    _.ctx.closePath();

    _.ctx.restore();
  };

  _.drawItemFrame = function(itemHeight, offset) {
    var drawStart = [offset + settings.margin, settings.height - itemHeight - (settings.margin * 2)];
    var drawEnd = [itemHeight, itemHeight];

    _.ctx.save();
    _.ctx.beginPath();
    _.ctx.rect(drawStart[0], drawStart[1], drawEnd[0], drawEnd[1]);
    _.ctx.lineWidth = 1;
    _.ctx.strokeStyle = '#808080';
    _.ctx.stroke();
    _.ctx.closePath();
    _.ctx.restore();

    return [drawStart, drawEnd];
  }

  return constructor;
})();
